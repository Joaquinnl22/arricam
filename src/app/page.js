"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/NavBar";
import BañoItem from "../components/Baño/BañoItem";
import BodegaItem from "../components/Bodega/BodegaItem";
import OficinaItem from "../components/Oficina/OficinaItem";
import ModalAgregar from "../components/Modal/ModalAdd";
import ModalEditar from "../components/Modal/ModalEdit";
import ModalDel from "../components/Modal/ModaDel";

export default function Home() {
  const [baños, setBaños] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [comedores, setComedores] = useState([]);
  const [camarines, setCamarines] = useState([]);
  const [guardias, setGuardias] = useState([]);
  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filterBySearch = (items) =>
    items.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const filterByType = (items) => {
    if (!selectedType) return items;
    return items.filter((item) => item.tipo === selectedType);
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/getItems");
      const data = await response.json();
      setBaños(data.filter((item) => item.tipo === "baño"));
      setBodegas(data.filter((item) => item.tipo === "bodega"));
      setOficinas(data.filter((item) => item.tipo === "oficina"));
      setComedores(data.filter((item) => item.tipo === "comedor"));
      setCamarines(data.filter((item) => item.tipo === "camarin"));
      setGuardias(data.filter((item) => item.tipo === "guardia"));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAgregar = () => setIsAgregarOpen(true);
  const handleOpenEditar = (item) => {
    setEditItem(item);
    setIsEditarOpen(true);
  };
  const handleOpenDelete = (item) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const handleCloseAgregar = () => setIsAgregarOpen(false);
  const handleCloseEditar = () => setIsEditarOpen(false);
  const handleCloseDelete = () => setIsDeleteOpen(false);

  const handleDeleteItem = async (id, cantidad) => {
    try {
      const response = await fetch(`/api/deleteItem`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cantidad }),
      });

      if (!response.ok) throw new Error("Failed to delete item");

      fetchItems(); 
      handleCloseDelete();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filterByState = (items, state) =>
    items.filter((item) => item.estado === state);

  const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + (item.cantidad || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <Navbar
        onAddClick={handleOpenAgregar}
        onSearch={setSearchTerm}
        onFilterChange={setSelectedType}
      />

      <ModalAgregar
        isOpen={isAgregarOpen}
        onClose={handleCloseAgregar}
        onSave={async (data) => {
          try {
            const formData = new FormData();
            for (const key in data) {
              formData.append(key, data[key]);
            }

            const response = await fetch("/api/addItem", {
              method: "POST",
              body: formData, 
            });

            if (!response.ok) throw new Error("Failed to add item");

            const result = await response.json();
            const newItem = result.data;

            
            if (newItem.tipo === "baño") setBaños((prev) => [...prev, newItem]);
            if (newItem.tipo === "bodega")
              setBodegas((prev) => [...prev, newItem]);
            if (newItem.tipo === "oficina")
              setOficinas((prev) => [...prev, newItem]);
            if (newItem.tipo === "camarin")
              setCamarines((prev) => [...prev, newItem]);
            if (newItem.tipo === "comedor")
              setComedores((prev) => [...prev, newItem]);
            if (newItem.tipo === "guardia")
              setGuardias((prev) => [...prev, newItem]);

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
            const result = await response.json();
            fetchItems();
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-3xl font-extrabold text-green-700 mb-6">
            <span className="inline-block p-2 bg-green-100 rounded-md">
              Disponible
            </span>
          </h2>
          <div className="space-y-6">
            {filterBySearch(filterByType(filterByState(baños, "disponible")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                    Baños
                  </h3>
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(baños, "disponible"))
                      )
                    )}{" "}
                    disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(baños, "disponible"))
                  ).map((baño) => (
                    <BañoItem
                      key={baño._id}
                      baño={baño}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filterBySearch(filterByType(filterByState(bodegas, "disponible")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Bodegas
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(bodegas, "disponible"))
                      )
                    )}{" "}
                    disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(bodegas, "disponible"))
                  ).map((bodega) => (
                    <BodegaItem
                      key={bodega._id}
                      bodega={bodega}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filterBySearch(filterByType(filterByState(oficinas, "disponible")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Oficinas
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(oficinas, "disponible"))
                      )
                    )}{" "}
                    disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(oficinas, "disponible"))
                  ).map((oficina) => (
                    <OficinaItem
                      key={oficina._id}
                      oficina={oficina}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filterBySearch(filterByType(filterByState(camarines, "disponible")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Camarines
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(camarines, "disponible"))
                      )
                    )}{" "}
                    disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(camarines, "disponible"))
                  ).map((camarin) => (
                    <OficinaItem
                      key={camarin._id}
                      oficina={camarin}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )} 
            {filterBySearch(filterByType(filterByState(comedores, "disponible")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Comedores
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(comedores, "disponible"))
                      )
                    )}{" "}
                    disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(comedores, "disponible"))
                  ).map((comedor) => (
                    <OficinaItem
                      key={comedor._id}
                      oficina={comedor}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}   
            {filterBySearch(filterByType(filterByState(guardias, "disponible")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Guardias
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(guardias, "disponible"))
                      )
                    )}{" "}
                    disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(guardias, "disponible"))
                  ).map((guardia) => (
                    <OficinaItem
                      key={guardia._id}
                      oficina={guardia}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}              
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-extrabold text-red-700 mb-6">
            <span className="inline-block p-2 bg-red-100 rounded-md">
              Ocupado
            </span>
          </h2>
          <div className="space-y-6">
            {filterBySearch(filterByType(filterByState(baños, "ocupado")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Baños
                </h3>
                <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(baños, "ocupado"))
                      )
                    )}{" "}
                    ocupados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(baños, "ocupado"))
                  ).map((baño) => (
                    <BañoItem
                      key={baño._id}
                      baño={baño}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filterBySearch(filterByType(filterByState(bodegas, "ocupado")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Bodegas
                </h3>
                <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(bodegas, "ocupado"))
                      )
                    )}{" "}
                    ocupados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(bodegas, "ocupado"))
                  ).map((bodega) => (
                    <BodegaItem
                      key={bodega._id}
                      bodega={bodega}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filterBySearch(filterByType(filterByState(oficinas, "ocupado")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  oficinas
                </h3>
                <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(oficinas, "ocupado"))
                      )
                    )}{" "}
                    ocupados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(oficinas, "ocupado"))
                  ).map((oficina) => (
                    <OficinaItem
                      key={oficina._id}
                      oficina={oficina}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            {filterBySearch(filterByType(filterByState(camarines, "ocupado")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Camarines
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(camarines, "ocupado"))
                      )
                    )}{" "}
                    ocupados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(camarines, "ocupado"))
                  ).map((camarin) => (
                    <OficinaItem
                      key={camarin._id}
                      oficina={camarin}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )} 
            {filterBySearch(filterByType(filterByState(comedores, "ocupado")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Comedores
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(comedores, "ocupado"))
                      )
                    )}{" "}
                    ocupados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(comedores, "ocupado"))
                  ).map((comedor) => (
                    <OficinaItem
                      key={comedor._id}
                      oficina={comedor}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}   
            {filterBySearch(filterByType(filterByState(guardias, "ocupado")))
              .length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                  Guardias
                </h3>
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full mr-2">
                    {calculateTotal(
                      filterBySearch(
                        filterByType(filterByState(guardias, "ocupado"))
                      )
                    )}{" "}
                    ocupados
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(
                    filterByType(filterByState(guardias, "ocupado"))
                  ).map((guardia) => (
                    <OficinaItem
                      key={guardia._id}
                      oficina={guardia}
                      onEdit={handleOpenEditar}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              </div>
            )}  
          </div>
        </section>
      </div>
    </div>
  );
}
