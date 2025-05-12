"use client";
import React from 'react';

export default function NotificationModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">¿Activar notificaciones?</h2>
        <p className="mb-6">Recibe alertas cuando se agregue un nuevo ítem.</p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Activar
          </button>
        </div>
      </div>
    </div>
  );
}
