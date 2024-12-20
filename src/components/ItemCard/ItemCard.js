export default function ItemCard({ item, onEdit, onDelete }) {
  const { title, descripcion, estado, cantidad, imagen } = item;

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-300"
      onClick={() => onEdit && onEdit(item)} // Call onEdit
    >
      {imagen ? (
        <img
          src={imagen}
          alt={title || "Imagen"}
          className="w-full max-w-full h-40 object-cover rounded-md mb-4"
        />
      ) : (
        <div className="w-full max-w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Sin imagen</p>
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-800">{title || "Sin título"}</h3>
      <p className="text-gray-600">{descripcion || "Sin descripción"}</p>
      <span
        className={`text-sm font-medium ${
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

      <p className="text-gray-700 mt-2">Cantidad: {cantidad || 0}</p>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent parent click event
            onDelete(item); // Call onDelete
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
