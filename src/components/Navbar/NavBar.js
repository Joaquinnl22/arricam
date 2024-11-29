"use client";

export default function NavBar({ onAddClick, onSearch, onFilterChange }) {
  return (
    <nav className="bg-black mb-5 text-yellow-400 p-4 w-full shadow-lg">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wider">ARRICAM</h1>

        {/* Campo de búsqueda */}
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="p-2 border rounded-lg mr-4 text-black w-full md:w-1/3"
        />

        {/* Filtro por tipo */}
        <select
          onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
          className="p-2 border rounded-lg text-black bg-white mr-4"
        >
          <option value="">Todos</option>
          <option value="baño">Baños</option>
          <option value="bodega">Bodegas</option>
          <option value="oficina">Oficinas</option>
          <option value="comedor">Comedores</option>
          <option value="camarin">Camarines</option>
          <option value="guardia">Guardiaes</option>
        </select>

        {/* Botón de agregar */}
        <button
          onClick={onAddClick}
          className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-md shadow-lg transition transform hover:scale-105"
        >
          + Agregar Ítem
        </button>
      </div>
    </nav>
  );
}
