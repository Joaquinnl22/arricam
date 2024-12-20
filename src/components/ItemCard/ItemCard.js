export default function ItemCard({ item, onEdit, onDelete }) {
  const { title, descripcion, estado, cantidad, imagen } = item;

  return (
    <div
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 flex flex-col"
      onClick={() => onEdit && onEdit(item)} // Call onEdit
    >
      {/* Imagen o marcador de "Sin imagen" */}
      {imagen ? (
        <img
          src={imagen}
          alt={title || "Imagen"}
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Sin imagen</p>
        </div>
      )}

      {/* Título */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate">
        {title || "Sin título"}
      </h3>

      {/* Descripción */}
      <p className="text-gray-600 text-sm sm:text-base mb-2 line-clamp-2">
        {descripcion || "Sin descripción"}
      </p>

      {/* Estado */}
      <span
        className={`text-sm font-medium mb-2 ${
          estado === "disponible"
            ? "text-green-600"
            : estado === "ocupado"
            ? "text-red-600"
            : "text-orange-600"
        }`}
      >
        {estado === "disponible"
          ? "Disponible"
          : estado === "ocupado"
          ? "Ocupado"
          : "Mantención"}
      </span>

      {/* Cantidad */}
      <p className="text-gray-700 text-sm sm:text-base mt-auto">
        <strong>Cantidad:</strong> {cantidad || 0}
      </p>

      {/* Botón Eliminar */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent parent click event
            onDelete(item); // Call onDelete
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-all"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}

