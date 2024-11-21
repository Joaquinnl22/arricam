import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const ModalEditar = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipo: "",
    title:"",
    descripcion: "",
    estado: "",
    nuevoEstado: "",
    cantidad: 1,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        tipo: item.tipo,
        title: item.title,
        descripcion: item.descripcion,
        estado: item.estado,
        nuevoEstado: item.estado, // Default al mismo estado
        cantidad: 1, // Default a 1
      });
    }
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Enviar los datos al manejador de guardado
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Editar Ítem</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nuevoEstado" className="block text-sm font-medium">Nuevo Estado</label>
            <select
              id="nuevoEstado"
              name="nuevoEstado"
              value={formData.nuevoEstado}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="disponible">Disponible</option>
              <option value="ocupado">Ocupado</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium">Cantidad</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

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
