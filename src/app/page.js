"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/NavBar";
import BañoItem from "../components/Baño/BañoItem";
import BodegaItem from "../components/Bodega/BodegaItem";
import OficinaItem from "../components/Oficina/OficinaItem";
import ModalAgregar from "../components/Modal/ModalAdd"; 
import ModalEditar from "../components/Modal/ModalEdit";

export default function Home() {
  const [baños, setBaños] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/getItems");
      const data = await response.json();
      setBaños(data.filter((item) => item.tipo === "baño"));
      setBodegas(data.filter((item) => item.tipo === "bodega"));
      setOficinas(data.filter((item) => item.tipo === "oficina"));
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

  const handleCloseAgregar = () => setIsAgregarOpen(false);
  const handleCloseEditar = () => setIsEditarOpen(false);

  const filterByState = (items, state) =>
    items.filter((item) => item.estado === state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <Navbar onAddClick={handleOpenAgregar} />

      <ModalAgregar
        isOpen={isAgregarOpen}
        onClose={handleCloseAgregar}
        onSave={async (data) => {
          try {
            const response = await fetch("/api/addItem", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Failed to add item");
            const result = await response.json();
            const newItem = result.data;
            if (newItem.tipo === "baño") setBaños((prev) => [...prev, newItem]);
            if (newItem.tipo === "bodega")
              setBodegas((prev) => [...prev, newItem]);
            if (newItem.tipo === "oficina")
              setOficinas((prev) => [...prev, newItem]);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-3xl font-extrabold text-green-700 mb-6">
            <span className="inline-block p-2 bg-green-100 rounded-md">
              Disponible
            </span>
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Baños</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByState(baños, "disponible").map((baño) => (
                  <BañoItem key={baño._id} baño={baño} onEdit={handleOpenEditar} />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Bodegas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByState(bodegas, "disponible").map((bodega) => (
                  <BodegaItem
                    key={bodega._id}
                    bodega={bodega}
                    onEdit={handleOpenEditar}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Oficinas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByState(oficinas, "disponible").map((oficina) => (
                  <OficinaItem
                    key={oficina._id}
                    oficina={oficina}
                    onEdit={handleOpenEditar}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-extrabold text-red-700 mb-6">
            <span className="inline-block p-2 bg-red-100 rounded-md">Ocupado</span>
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Baños</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByState(baños, "ocupado").map((baño) => (
                  <BañoItem key={baño._id} baño={baño} onEdit={handleOpenEditar} />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Bodegas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByState(bodegas, "ocupado").map((bodega) => (
                  <BodegaItem
                    key={bodega._id}
                    bodega={bodega}
                    onEdit={handleOpenEditar}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Oficinas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByState(oficinas, "ocupado").map((oficina) => (
                  <OficinaItem
                    key={oficina._id}
                    oficina={oficina}
                    onEdit={handleOpenEditar}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}