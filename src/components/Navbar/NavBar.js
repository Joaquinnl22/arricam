"use client";
import { useRouter } from "next/navigation";

export default function NavBar({ onAddClick, onFilterChange, onBackupClick }) {
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
    <nav className="flex flex-wrap justify-between items-center bg-black text-white px-4 sm:px-6 py-3 shadow-md">
      {/* Logo */}
      <h1
        className="text-xl sm:text-3xl font-bold tracking-wider cursor-pointer mb-2 sm:mb-0"
        onClick={() => router.push("/protegido")}
      >
        ARRICAM
      </h1>

      {/* Menú Responsive */}
      <div className="flex flex-wrap items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        {/* Filtro por tipo */}
        <select
          onChange={handleFilterChange}
          className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-md shadow-lg transition transform hover:scale-105"
        >
          <option value="">Todos</option>
          <option value="baño">Baños</option>
          <option value="bañoEspecial">Baños Especiales</option>
          <option value="BOD20">BOD20</option>
          <option value="BOD40">BOD40</option>
          <option value="oficina">Oficinas (OPL)</option>
          <option value="oficina con baño">Oficinas con baño (OCB)</option>
          <option value="comedor">Comedores</option>
          <option value="camarin">Camarines</option>
          <option value="guardia">Guardias</option>
          <option value="reef">Reef</option>
        </select>

        {/* Botón de agregar */}
        <button
          onClick={onAddClick}
          className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-md shadow-lg transition transform hover:scale-105"
        >
          + Agregar Modulo
        </button>
        {/* Botón Backup */}
        <button
          onClick={onBackupClick}
          className="w-full sm:w-auto bg-yellow-400 hover:bg-blue-300 text-black px-4 py-2 rounded-md shadow-lg transition transform hover:scale-105"
        >
          Ver Historial
        </button>
      </div>
    </nav>
  );
}
