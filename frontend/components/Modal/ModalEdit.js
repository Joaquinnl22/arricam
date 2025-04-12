"use client";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ModalEditar = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipo: "",
    title: "",
    descripcion: "",
    estado: "",
    nuevoEstado: "",
    cantidad: 1,
    imagenes: [],
    arrendadoPor: "", // Nuevo campo
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        tipo: item.tipo,
        title: item.title,
        descripcion: item.descripcion,
        estado: item.estado,
        nuevoEstado: "",
        cantidad: 1,
        imagenes: item.imagenes || (item.imagen ? [item.imagen] : []),
        arrendadoPor: "",
      });
    }
  }, [item]);
  

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === formData.imagenes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? formData.imagenes.length - 1 : prevIndex - 1
    );
  };

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

    if (formData.nuevoEstado === "arriendo" && !formData.arrendadoPor.trim()) {
      setError("Debes ingresar el nombre de la persona que arrienda.");
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg text-gray-800">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Editar Ítem</h2>

        {/* Carrusel de imágenes */}
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
          {formData.imagenes.length > 0 ? (
            <>
              <img
                src={formData.imagenes[currentImageIndex]}
                alt={formData.title}
                className="object-cover w-full h-full"
              />
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200"
                onClick={handlePrevImage}
              >
                <FaArrowLeft />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200"
                onClick={handleNextImage}
              >
                <FaArrowRight />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-gray-500">Sin imagen disponible</p>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre:</label>
          <div className="block">{formData.title}</div>

          <label className="block text-sm font-medium text-gray-700 mt-2">Descripción:</label>
          <div className="block">{formData.descripcion}</div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nuevo Estado:</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {["disponible", "arriendo", "mantencion"]
                .filter((estado) => estado !== formData.estado)
                .map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    onClick={() =>
                      setFormData((prevData) => ({
                        ...prevData,
                        nuevoEstado: estado,
                        arrendadoPor: estado === "arriendo" ? "" : prevData.arrendadoPor,
                      }))
                    }
                    className={`flex items-center px-4 py-2 border rounded-lg ${
                      formData.nuevoEstado === estado
                        ? "bg-blue-100 border-blue-500"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <span className="ml-2 capitalize">{estado}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Campo de arrendadoPor (solo si el nuevo estado es "arriendo") */}
          {formData.nuevoEstado === "arriendo" && (
            <div className="mb-4">
              <label htmlFor="arrendadoPor" className="block text-sm font-medium text-gray-700">
                Arrendado por:
              </label>
              <input
                type="text"
                id="arrendadoPor"
                name="arrendadoPor"
                value={formData.arrendadoPor}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    arrendadoPor: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded text-gray-800"
                required
              />
            </div>
          )}

          {/* Cantidad */}
          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
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
              className="w-full p-2 border border-gray-300 rounded text-gray-800"
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
