"use client";

export default function ItemCard({ item, onEdit, onDelete }) {
  const { title, descripcion, estado, cantidad, imagen, imagenes } = item;

  // Usar imagen principal si existe, si no usar la primera del array
  const imagenURL =
    imagen ||
    (imagenes && imagenes.length > 0 ? imagenes[0] : null);

  return (
    <div
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 flex flex-col"
      onClick={() => onEdit && onEdit(item)} // Call onEdit
    >
      {imagenURL ? (
        <img
          src={imagenURL}
          alt={title || "Imagen"}
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Sin imagen</p>
        </div>
      )}

      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate">
        {title || "Sin título"}
      </h3>

      <p className="text-gray-600 text-sm sm:text-base mb-2 line-clamp-2">
        {descripcion || "Sin descripción"}
      </p>

      <span
        className={`text-sm font-medium mb-2 ${
          estado === "disponible"
            ? "text-green-600"
            : estado === "arriendo"
            ? "text-red-600"
            : "text-orange-600"
        }`}
      >
        {estado}
      </span>

      <p className="text-gray-700 text-sm sm:text-base mt-auto">
        <strong>Cantidad:</strong> {cantidad || 0}
      </p>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-all"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
