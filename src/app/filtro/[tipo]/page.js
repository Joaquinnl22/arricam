"use client";
import React, { use } from "react";
import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa"; // Import loading icon
import Navbar from "../../../components/Navbar/NavBar";
import ItemCard from "../../../components/ItemCard/ItemCard";
import ModalAgregar from "../../../components/Modal/ModalAdd";
import ModalEditar from "../../../components/Modal/ModalEdit";
import ModalDel from "../../../components/Modal/ModaDel";

export default function FiltroPorTipoPage({ params }) {
  const { tipo } = use(params);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState({
    disponible: [],
    mantencion: [],
    arriendo: [],
  });

  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const normalize = (str) => {
    if (!str) return ""; // Si str es null o undefined, retorna una cadena vacía
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const decodedTipo = decodeURIComponent(tipo);

  const fetchItems = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch("/api/getItems");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setItems(data); // Update items
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const groupItemsByTipo = (items) => {
    const filteredByTipo = decodedTipo
      ? items.filter(
          (item) => normalize(item.tipo || "") === normalize(decodedTipo)
        )
      : items;

    setFilteredItems({
      disponible: filteredByTipo.filter((item) => item.estado === "disponible"),
      mantencion: filteredByTipo.filter((item) => item.estado === "mantencion"),
      arriendo: filteredByTipo.filter((item) => item.estado === "arriendo"),
    });
  };

  useEffect(() => {
    fetchItems(); // Cargar ítems al montar el componente
  }, []);

  useEffect(() => {
    groupItemsByTipo(items); // Agrupar ítems cada vez que se actualicen
  }, [items, decodedTipo]);

  const handleOpenAgregar = () => setIsAgregarOpen(true);
  const handleCloseAgregar = () => setIsAgregarOpen(false);

  const handleOpenEditar = (item) => {
    setEditItem(item);
    setIsEditarOpen(true);
  };
  const handleCloseEditar = () => setIsEditarOpen(false);

  const handleOpenDelete = (item) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };
  const handleCloseDelete = () => setIsDeleteOpen(false);
  const handleDeleteItem = async (id, cantidadEliminar) => {
    try {
      const response = await fetch(`/api/deleteItem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cantidadEliminar }), // Cambiado a cantidadEliminar
      });

      if (!response.ok) throw new Error("Failed to delete item");

      await fetchItems(); // Refresca los ítems después de eliminar
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const renderItems = (itemsArray, showArrendadoPor = false) => {
    if (!itemsArray || itemsArray.length === 0) {
      return <p className="text-center text-gray-500">No hay ítems.</p>;
    }
    return itemsArray.map((item) => (
      <div key={item._id} className="bg-gray-50 p-4 rounded-lg shadow">
        <ItemCard
          item={item}
          onEdit={handleOpenEditar}
          onDelete={handleOpenDelete}
        />
        {showArrendadoPor && (
          <p className="text-sm text-gray-600 mt-2">
            <strong>Arrendado por:</strong> {item.arrendadoPor || "NaN"}
          </p>
        )}
      </div>
    ));
  };

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const calculateTotal = (items) =>
    (items || []).reduce((sum, item) => sum + (item.cantidad || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6">
      <Navbar onAddClick={handleOpenAgregar} />

      <ModalAgregar
        isOpen={isAgregarOpen}
        onClose={handleCloseAgregar}
        onSave={async (formData) => {
          // formData ya es un FormData válido
          try {
            const response = await fetch("/api/addItem", {
              method: "POST",
              body: formData, // ✅ Enviar directamente sin modificarlo
            });

            if (!response.ok) throw new Error("Failed to add item");

            await fetchItems(); // Refresca los ítems después de agregar
            await notifyUser("Item agregado", "Un nuevo container fue añadido al sistema.");
            handleCloseAgregar();
          } catch (error) {
            console.error(error);
          }
        }}
      />

      <ModalEditar
        isOpen={isEditarOpen}
        item={editItem}
        onClose={handleCloseEditar}
        onSave={async (data) => {
          try {
            const response = await fetch("/api/updateItem", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update item");

            await fetchItems(); // Refresca los ítems después de editar
            handleCloseEditar();
          } catch (error) {
            console.error(error);
          }
        }}
      />

      <ModalDel
        isOpen={isDeleteOpen}
        item={deleteItem}
        onClose={handleCloseDelete}
        onDelete={handleDeleteItem}
      />

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <FaSpinner className="text-black text-4xl animate-spin" />
        </div>
      ) : (
        <>
          <div className="relative mb-6 mt-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 text-center">
              {capitalizeFirstLetter(decodedTipo)}s
            </h1>
            <div className="absolute right-0 top-0 text-blue-600 text-xl sm:text-2xl font-bold">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow">
                Stock total:{" "}
                {calculateTotal(filteredItems.disponible) +
                  calculateTotal(filteredItems.mantencion) +
                  calculateTotal(filteredItems.arriendo)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-green-600">
                  Disponible para arriendo
                </h2>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  {calculateTotal(filteredItems.disponible)} disponibles
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderItems(filteredItems.disponible)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-yellow-600">
                  Mantención para arriendo
                </h2>
                <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
                  {calculateTotal(filteredItems.mantencion)} en mantención
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderItems(filteredItems.mantencion)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-red-600">
                  Arrendados
                </h2>
                <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
                  {calculateTotal(filteredItems.arriendo)} arriendos
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderItems(filteredItems.arriendo, true)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
