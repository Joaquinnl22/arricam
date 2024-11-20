"use client";

export default function NavBar({ onAddClick }) {
  return (
    <nav className="bg-black text-yellow-400 p-4 w-full shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        {/* Título de la barra de navegación */}
        <h1 className="text-3xl font-bold tracking-wider">
          ARRICAM
        </h1>

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
