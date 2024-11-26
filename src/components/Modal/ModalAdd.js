  import React, { useState } from "react";

  const ModalAgregar = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      tipo: "",
      title:"",
      descripcion: "",
      cantidad: 1,
      estado: "disponible",
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-semibold mb-4">Agregar Item</h2>
          <form onSubmit={handleSubmit}>
          <div className="mb-4">
          <label htmlFor="tipo" className="block text-sm font-medium">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded bg-white"
            required
          >
            <option value="" disabled>Seleccione un tipo</option>
            <option value="baño">Baño</option>
            <option value="oficina">Oficina</option>
            <option value="bodega">Bodega</option>
          </select>
        </div>

        <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium">Nombre</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium">Descripción</label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
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

            <div className="mb-4">
              <label htmlFor="estado" className="block text-sm font-medium">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="disponible">Disponible</option>
                <option value="ocupado">Ocupado</option>
              </select>
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
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default ModalAgregar;