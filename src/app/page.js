"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/NavBar";
import ModalAgregar from "../components/Modal/ModalAdd";
import {
  FaToilet,
  FaWarehouse,
  FaBuilding,
  FaUtensils,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { ImOffice } from "react-icons/im";
import { PiShippingContainerFill } from "react-icons/pi";

export default function Home() {
  const [items, setItems] = useState({
    baños: [],
    BOD40: [],
    BOD20: [],
    oficinas: [],
    oficinasconbaño: [],
    comedores: [],
    camarines: [],
    guardias: [],
    reef: [],
  });
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState("");
  const [isAgregarOpen, setIsAgregarOpen] = useState(false);
  const handleCloseAgregar = () => setIsAgregarOpen(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/getItems");
      const data = await response.json();

      const groupedItems = data.reduce((acc, item) => {
        if (!acc[item.tipo]) acc[item.tipo] = [];
        acc[item.tipo].push(item);
        return acc;
      }, {});

      setItems({
        baños: groupedItems.baño || [],
        BOD20: groupedItems.BOD20 || [],
        BOD40: groupedItems.BOD40 || [],
        oficinas: groupedItems.oficina || [],
        oficinasconbaño: groupedItems["oficina con baño"] || [],
        comedores: groupedItems.comedor || [],
        camarines: groupedItems.camarin || [],
        guardias: groupedItems.guardia || [],
        reef: groupedItems.reef || [],
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAgregar = () => setIsAgregarOpen(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const calculateStateCounts = (items, state) => {
    return items
      .filter((item) => item.estado === state)
      .reduce((sum, item) => sum + (item.cantidad || 0), 0);
  };

  const calculateGlobalStock = (items) => {
    return Object.values(items).reduce((total, itemGroup) => {
      return (
        total +
        itemGroup.reduce((groupSum, item) => groupSum + (item.cantidad || 0), 0)
      );
    }, 0);
  };
  const renderBlock = (type, items, Icon) => {
    const availableCount = calculateStateCounts(items, "disponible");
    const maintenanceCount = calculateStateCounts(items, "mantencion");
    const occupiedCount = calculateStateCounts(items, "arriendo");

    return (
      <div key={type} className="">
        <div className="bg-white rounded-xl shadow-md p-3">
          <div className="grid grid-cols-5 gap-2">
            <div className="flex items-center justify-center mb-2">
              <Icon className="h-8 w-8 text-gray-700 mr-1" />
              <h3 className="text-sm sm:text-lg font-bold text-gray-800">
                {type}
              </h3>
            </div>
            {/* Números destacados */}
            <div className="bg-green-100 rounded-lg p-1 shadow text-green-600 font-extrabold text-3xl sm:text-4xl text-center border-2 border-green-600">
              {availableCount}
            </div>
            <div className="bg-yellow-100 rounded-lg p-1 shadow text-yellow-500 font-extrabold text-3xl sm:text-4xl text-center border-2 border-yellow-500">
              {maintenanceCount}
            </div>
            <div className="bg-red-100 rounded-lg p-1 shadow text-red-500 font-extrabold text-3xl sm:text-4xl text-center border-2 border-red-500">
              {occupiedCount}
            </div>
            <div className="bg-blue-100 rounded-lg p-1 shadow text-blue-500 font-extrabold text-3xl sm:text-4xl text-center border-2 border-blue-500">
              {availableCount + maintenanceCount + occupiedCount}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const globalAvailable = Object.values(items).reduce((total, itemGroup) => {
    return (
      total +
      itemGroup
        .filter((item) => item.estado === "disponible")
        .reduce((sum, item) => sum + (item.cantidad || 0), 0)
    );
  }, 0);

  const globalOccupied = Object.values(items).reduce((total, itemGroup) => {
    return (
      total +
      itemGroup
        .filter((item) => item.estado === "arriendo")
        .reduce((sum, item) => sum + (item.cantidad || 0), 0)
    );
  }, 0);

  const globalStock = calculateGlobalStock(items);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Spinner durante la carga */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <PiShippingContainerFill className="text-black text-4xl animate-spin" />
        </div>
      ) : (
        <>
          {/* Contenido principal */}
          <Navbar
            onAddClick={handleOpenAgregar}
            onFilterChange={setSelectedType}
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

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-gray-800 my-6">
            Stock de los container
          </h1>

          {/* Resumen Global */}
          <div className="bg-white rounded-xl shadow-md p-4 transition-transform transform hover:scale-105 hover:shadow-lg flex flex-col items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Resumen Global
            </h2>
            <div className="grid grid-cols-3 gap-4 w-full text-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Disponible para arriendo
                </h3>
                <div className="text-2xl font-extrabold text-green-600">
                  {globalAvailable}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Arriendado{" "}
                </h3>
                <div className="text-2xl font-extrabold text-red-500">
                  {globalOccupied}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-600">
                  Stock Total
                </h3>
                <div className="text-2xl font-extrabold text-blue-500">
                  {globalStock}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="grid grid-cols-5 gap-4 items-center text-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Items
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Disponible para arriendo
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                En Mantención
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Arrendados
              </h3>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Stock Total
              </h3>
            </div>
          </div>
          <div className="grid grid-rows-8 gap-4">
            {renderBlock("Oficinas", items.oficinas, FaBuilding)}
            {renderBlock("Oficinas con baño", items.oficinasconbaño, ImOffice)}
            {renderBlock("Baños", items.baños, FaToilet)}
            {renderBlock("Comedores", items.comedores, FaUtensils)}
            {renderBlock("Camarines", items.camarines, FaUsers)}
            {renderBlock("Guardias", items.guardias, FaShieldAlt)}
            {renderBlock("BOD20", items.BOD20, FaWarehouse)}
            {renderBlock("BOD40", items.BOD40, FaWarehouse)}
            {renderBlock("Reef", items.reef, PiShippingContainerFill)}
          </div>
        </>
      )}
    </div>
  );
}
