"use client";

import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaTools } from "react-icons/fa";

const ModalEditar = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipo: "",
    title: "",
    descripcion: "",
    estado: "",
    nuevoEstado: "",
    cantidad: 1,
    imagen: null,
  });
  const [error, setError] = useState("");
  const estadosPosibles = ["disponible", "arriendo", "mantencion"];

  useEffect(() => {
    if (item) {
      setFormData({
        tipo: item.tipo,
        title: item.title,
        descripcion: item.descripcion,
        estado: item.estado,
        nuevoEstado: "",
        cantidad: 1,
        imagen: item.imagen,
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nuevoEstado) {
      setError("Por favor selecciona un nuevo estado.");
      return;
    }
    if (formData.cantidad > item.cantidad) {
      setError(
        `La cantidad ingresada (${formData.cantidad}) excede la disponible (${item.cantidad}).`
      );
      return;
    }
    onSave(formData);
    console.log("Data sent to server:", formData);
    onClose();
  };

  const renderEstadoIcon = (estado) => {
    if (estado === "disponible")
      return <FaCheckCircle className="text-green-500 text-xl sm:text-2xl" />;
    if (estado === "arriendo")
      return <FaTimesCircle className="text-red-500 text-xl sm:text-2xl" />;
    if (estado === "mantencion")
      return <FaTools className="text-yellow-500 text-xl sm:text-2xl" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Editar Ítem</h2>

        {/* Imagen */}
        <div className="mb-4">
          {formData.imagen ? (
            <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={formData.imagen}
                alt={formData.title}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-lg">
              <p className="text-gray-500">Sin imagen disponible</p>
            </div>
          )}
        </div>

        {/* Información del ítem */}
        <div className="mb-4">
          <div>
            <strong>Tipo:</strong> {formData.tipo}
          </div>
          <div>
            <strong>Título:</strong> {formData.title}
          </div>
          <div>
            <strong>Descripción:</strong> {formData.descripcion}
          </div>
          <div>
            <strong>Estado Actual:</strong> {formData.estado}
          </div>
        </div>

        {/* Selección de nuevo estado */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nuevoEstado" className="block text-sm font-medium">
              Nuevo Estado:
            </label>
            <div className="flex flex-wrap gap-4 mt-2">
              {estadosPosibles
                .filter((estado) => estado !== formData.estado)
                .map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    onClick={() =>
                      setFormData((prevData) => ({
                        ...prevData,
                        nuevoEstado: estado,
                      }))
                    }
                    className={`flex items-center px-4 py-2 border rounded-lg ${
                      formData.nuevoEstado === estado
                        ? "bg-blue-100 border-blue-500"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {renderEstadoIcon(estado)}
                    <span className="ml-2 capitalize">{estado}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Cantidad */}
          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium">
              Cantidad
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={(e) => {
                const cantidadIngresada = parseInt(e.target.value, 10);
                if (cantidadIngresada > item.cantidad) {
                  setError(
                    `Cantidad ingresada (${cantidadIngresada}) excede la disponible (${item.cantidad}).`
                  );
                } else {
                  setError("");
                }
                setFormData((prevData) => ({
                  ...prevData,
                  cantidad: cantidadIngresada,
                }));
              }}
              min="1"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <small className="text-gray-500">
              Cantidad disponible: {item.cantidad}
            </small>
          </div>

          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditar;
