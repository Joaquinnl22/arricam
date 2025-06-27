"use client";
import React, { useEffect, useState } from "react";

const ModalCambios = ({ isOpen, onClose }) => {
  const [cambios, setCambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/backup")
        .then((res) => res.json())
        .then((data) => {
          setCambios(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Error al cargar los cambios recientes.");
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-auto">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-3xl text-gray-800 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          🕑 Historial de Cambios
        </h2>

        {loading ? (
          <div className="text-center text-gray-500 animate-pulse">
            Cargando cambios...
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : cambios.length === 0 ? (
          <div className="text-center text-gray-500">
            No hay cambios recientes.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cambios.map((item) => (
              <li key={item._id} className="py-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.descripcion}</p>
                    <p className="text-xs text-gray-400">
                      Acción:{" "}
                      <span className="font-medium">{item.accion || "—"}</span>{" "}
                      | Estado:{" "}
                      <span className="font-medium">{item.estado}</span> |
                      Cantidad: {item.cantidad}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 mt-2 sm:mt-0 sm:text-right">
                    {new Date(item.updatedAt).toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          ✖
        </button>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-300 text-black rounded-full hover:bg-yello-300 shadow-lg  transition text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambios;
