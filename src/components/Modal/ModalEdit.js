import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ModalEditar = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipo: "",
    title: "",
    descripcion: "",
    estado: "",
    nuevoEstado: "",
    cantidad: 1,
  });
  const [error, setError] = useState(""); // Estado para manejar el error

  useEffect(() => {
    if (item) {
      const nextEstado = item.estado === "disponible" ? "ocupado" : "disponible";
      setFormData({
        tipo: item.tipo,
        title: item.title,
        descripcion: item.descripcion,
        estado: item.estado,
        nuevoEstado: nextEstado,
        cantidad: 1,
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.cantidad > item.cantidad) {
      setError(`La cantidad ingresada (${formData.cantidad}) excede la disponible (${item.cantidad}).`);
      return;
    }
    onSave(formData);
    onClose();
  };

  const renderEstadoIcon = () => {
    if (formData.nuevoEstado === "disponible") {
      return <FaCheckCircle className="text-green-500 text-3xl" />;
    }
    return <FaTimesCircle className="text-red-500 text-3xl" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Editar Ítem</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center">
            <span className="mr-2 font-medium">Nuevo Estado:</span>
            {renderEstadoIcon()}
            <span className="ml-2 capitalize">{formData.nuevoEstado}</span>
          </div>

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
                  setError(`Cantidad ingresada (${cantidadIngresada}) excede la disponible (${item.cantidad}).`);
                } else {
                  setError(""); // Limpiar el error si la cantidad es válida
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

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
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
