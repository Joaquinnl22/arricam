import React, { useState } from "react";

const ModalAgregar = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipo: "",
    title: "",
    descripcion: "",
    cantidad: 1,
    estado: "disponible",
    imagen: null, // Agregado para la imagen
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      imagen: file, // Guardar la imagen seleccionada
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pasar el formulario al manejador

    // Limpiar el formulario después de guardar
    setFormData({
      tipo: "",
      title: "",
      descripcion: "",
      cantidad: 1,
      estado: "disponible",
      imagen: null, // Limpiar la imagen
    });

    onClose(); // Cerrar el modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 sm:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
          Agregar Ítem
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Tipo */}
          <div className="mb-4">
            <label htmlFor="tipo" className="block text-sm font-medium">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              required
            >
              <option value="" disabled>
                Seleccione un tipo
              </option>
              <option value="baño">Baño</option>
              <option value="oficina">Oficina</option>
              <option value="oficina con baño">Oficina con baño</option>
              <option value="BOD20">BOD20</option>
              <option value="BOD40">BOD40</option>
              <option value="comedor">Comedores</option>
              <option value="camarin">Camarines</option>
              <option value="guardia">Guardias</option>
              <option value= "reef">Reef</option>
            </select>
          </div>

          {/* Nombre */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium">
              Nombre
            </label>
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

          {/* Descripción */}
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded resize-none"
              rows="3"
              required
            ></textarea>
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
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Estado */}
          <div className="mb-4">
            <label htmlFor="estado" className="block text-sm font-medium">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              required
            >
              <option value="" disabled>
                Seleccione un Estado
              </option>
              <option value="disponible">Disponible</option>
              <option value="ocupado">Ocupado</option>
              <option value="mantencion">Mantención</option>
            </select>
          </div>

          {/* Imagen */}
          <div className="mb-4">
            <label htmlFor="imagen" className="block text-sm font-medium">
              Imagen
            </label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Botones */}
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
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregar;
