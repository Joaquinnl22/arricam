"use client";
import { useRouter } from 'next/navigation';

export default function NavBar({ onAddClick, onFilterChange }) {
  const router = useRouter();

  const handleFilterChange = (e) => {
    const selectedValue = e.target.value;
    if (onFilterChange) {
      onFilterChange(selectedValue); // Actualiza el estado en el componente principal
    }
    if (selectedValue) {
      router.push(`/filtro/${selectedValue}`); // Navega a la página de filtro
    } else {
      router.push("/"); // Navega a la página principal si selecciona "Todos"
    }
  };

  return (
    <nav className="flex justify-between items-center bg-black text-white px-6 py-4 shadow-md">
   
   <h1
      className="text-3xl font-bold tracking-wider cursor-pointer"
      onClick={() => router.push("/")}
    >
      ARRICAM
    </h1>
        {/* Campo de búsqueda
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="p-2 border rounded-lg mr-4 text-black w-full md:w-1/3"
        /> */}
 <div className="flex space-x-4">
    {/* Filtro por tipo */}
    <select
      onChange={handleFilterChange}
      className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-md shadow-lg transition transform hover:scale-105"
    >
      <option value="">Todos</option>
      <option value="baño">Baños</option>
      <option value="bodega">Bodegas</option>
      <option value="oficina">Oficinas</option>
      <option value="oficina con baño">Oficinas con baño</option>
      <option value="comedor">Comedores</option>
      <option value="camarin">Camarines</option>
      <option value="guardia">Guardias</option>
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
