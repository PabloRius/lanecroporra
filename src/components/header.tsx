"use client";
export function Header() {
  return (
    <header className="text-center py-2 sm:py-4">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-0 sm:mb-4 font-serif">
        La Necroporra
      </h1>
      <p className="hidden sm:block text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
        El reto anual más controvertido de España. ¿Tienes lo que hace falta
        para predecir el futuro?
      </p>
    </header>
  );
}
