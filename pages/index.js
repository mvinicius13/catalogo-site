
import Head from 'next/head';
import { useState } from 'react';
import Catalog from '../components/Catalog';

export default function Home() {
  const [categoria, setCategoria] = useState('i5');

  const categorias = {
    i5: 'Notebooks i5',
    i7: 'Notebooks i7',
    mac: 'Macbooks',
    desktop: 'Desktops',
  };

  return (
    <>
      <Head>
        <title>Catálogo de Equipamentos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 flex justify-center gap-4 text-sm sm:text-base">
          {Object.entries(categorias).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategoria(key)}
              className={`px-4 py-2 rounded-full transition ${
                categoria === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <main className="p-4 max-w-7xl mx-auto">
        <Catalog categoria={categoria} />
      </main>
    </>
  );
}
