import { FaTrash } from "react-icons/fa";

export default function BodegaItem({ bodega, onEdit, onDelete }) {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-300"
      onClick={() => onEdit(bodega)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">{bodega.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            bodega.estado === 'disponible'
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {bodega.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
        </span>
        {/* Icono de basura */}
                <FaTrash
          className="text-red-500 hover:text-red-700 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Evitar la propagación al contenedor
            onDelete(bodega); // Abrir el modal de eliminación
          }}
        />
      </div>
      <p className="text-gray-600 mb-1">{bodega.descripcion}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-500">Cantidad:</p>
        <span className="text-lg font-semibold text-gray-700">{bodega.cantidad}</span>
      </div>
    </div>
  );
}
