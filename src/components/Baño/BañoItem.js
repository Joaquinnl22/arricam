export default function BañoItem({ baño, onEdit }) {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-300"
      onClick={() => onEdit(baño)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">{baño.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            baño.estado === 'disponible'
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {baño.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
        </span>
      </div>
      <p className="text-gray-600 mb-1">{baño.descripcion}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-500">Cantidad:</p>
        <span className="text-lg font-semibold text-gray-700">{baño.cantidad}</span>
      </div>
    </div>
  );
}
