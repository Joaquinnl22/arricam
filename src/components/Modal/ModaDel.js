"use client";
import React, { useState, useEffect } from "react";

const ModalDel = ({ isOpen, item, onClose, onDelete }) => {
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setCantidad(1);
      setError("");
    }
  }, [item]);

  const handleConfirm = () => {
    if (cantidad > item.cantidad) {
      setError(`La cantidad a eliminar excede la disponible (${item.cantidad}).`);
    } else {
      onDelete(item._id, -cantidad);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Eliminar Cantidad
        </h2>
        <p className="text-gray-700 mb-4">
          Ingresa la cantidad que deseas eliminar de <strong>{item.title}</strong>.
        </p>
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
          min="1"
          max={item.cantidad}
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <small className="text-gray-500">
          Cantidad disponible: {item.cantidad}
        </small>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDel;
