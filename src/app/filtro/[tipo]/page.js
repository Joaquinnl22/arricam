"use client";
import React, { use } from "react";
import { useState, useEffect, useMemo } from "react";
import { FaSpinner } from "react-icons/fa"; // Import loading icon
import Navbar from "../../../components/Navbar/NavBar";
import ItemCard from "../../../components/ItemCard/ItemCard";
import ModalAgregar from "../../../components/Modal/ModalAdd";
import ModalEditar from "../../../components/Modal/ModalEdit";
import ModalDel from "../../../components/Modal/ModaDel";
import ModalBackup from "../../../components/Modal/ModalBackup";
import { ESTADOS, transicionesDesde } from "@/lib/estados";

// Una entrada por columna del tablero. Las clases de Tailwind van completas
// (no interpoladas) para que el compilador las detecte.
const COLUMNAS = [
  {
    estado: ESTADOS.DISPONIBLE,
    titulo: "Disponible para arriendo",
    etiqueta: "disponibles",
    colorTitulo: "text-green-600",
    colorBadge: "bg-green-100 text-green-700",
    enStock: true,
  },
  {
    estado: ESTADOS.MANTENCION,
    titulo: "Mantención para arriendo",
    etiqueta: "en mantención",
    colorTitulo: "text-yellow-600",
    colorBadge: "bg-yellow-100 text-yellow-700",
    enStock: true,
  },
  {
    estado: ESTADOS.ARRIENDO,
    titulo: "Arrendados",
    etiqueta: "arriendos",
    colorTitulo: "text-red-600",
    colorBadge: "bg-red-100 text-red-700",
    enStock: true,
    contraparte: { campo: "arrendadoPor", label: "Arrendado por:" },
  },
  {
    // Lo vendido sale del stock, por eso no suma al "Stock total".
    estado: ESTADOS.VENTA,
    titulo: "Ventas",
    etiqueta: "vendidos",
    colorTitulo: "text-purple-600",
    colorBadge: "bg-purple-100 text-purple-700",
    enStock: false,
    contraparte: { campo: "vendidoA", label: "Vendido a:" },
  },
];

const normalize = (str) => {
  if (!str) return ""; // Si str es null o undefined, retorna una cadena vacía
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
};

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const calculateTotal = (items) =>
  (items || []).reduce((sum, item) => sum + (item.cantidad || 0), 0);

export default function FiltroPorTipoPage({ params }) {
  const { tipo } = use(params);
  const [items, setItems] = useState([]);

  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const [editItem, setEditItem] = useState(null);
  const [mostrarBackup, setMostrarBackup] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

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

  // Ítems del tipo actual, agrupados por estado (una clave por columna).
  const filteredItems = useMemo(() => {
    const filteredByTipo = decodedTipo
      ? items.filter(
          (item) => normalize(item.tipo || "") === normalize(decodedTipo)
        )
      : items;

    return Object.fromEntries(
      COLUMNAS.map(({ estado }) => [
        estado,
        filteredByTipo.filter((item) => item.estado === estado),
      ])
    );
  }, [items, decodedTipo]);

  const stockTotal = COLUMNAS.filter((col) => col.enStock).reduce(
    (sum, { estado }) => sum + calculateTotal(filteredItems[estado]),
    0
  );

  useEffect(() => {
    fetchItems(); // Cargar ítems al montar el componente
  }, []);

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

  const renderItems = (itemsArray, contraparte) => {
    if (!itemsArray || itemsArray.length === 0) {
      return <p className="text-center text-gray-500">No hay ítems.</p>;
    }
    return itemsArray.map((item) => (
      <div key={item._id} className="bg-gray-50 p-4 rounded-lg shadow">
        <ItemCard
          item={item}
          // Un ítem sin estados destino (p. ej. ya vendido) no se puede editar.
          onEdit={
            transicionesDesde(item.estado).length > 0
              ? handleOpenEditar
              : undefined
          }
          onDelete={handleOpenDelete}
        />
        {contraparte && (
          <p className="text-sm text-gray-600 mt-2">
            <strong>{contraparte.label}</strong>{" "}
            {item[contraparte.campo] || "NaN"}
          </p>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6">
      <Navbar
        onAddClick={() => setIsAgregarOpen(true)}
        onBackupClick={() => setMostrarBackup(true)}
      />
      <ModalBackup
        isOpen={mostrarBackup}
        onClose={() => setMostrarBackup(false)}
      />
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
                Stock total: {stockTotal}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {COLUMNAS.map(
              ({ estado, titulo, etiqueta, colorTitulo, colorBadge, contraparte }) => (
                <div
                  key={estado}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"
                >
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <h2 className={`text-lg sm:text-xl font-semibold ${colorTitulo}`}>
                      {titulo}
                    </h2>
                    <span
                      className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ${colorBadge}`}
                    >
                      {calculateTotal(filteredItems[estado])} {etiqueta}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                    {renderItems(filteredItems[estado], contraparte)}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
