// src/app/info/enlaces/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Enlace {
  titulo: string;
  url: string;
}

export default function EnlacesPage() {
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);

  useEffect(() => {
    setEnlaces([
      { titulo: "Ministerio para la Transición Ecológica", url: "https://www.miteco.gob.es/" },
      { titulo: "FAO - Bosques", url: "https://www.fao.org/forestry/es/" },
      { titulo: "ONU Cambio Climático", url: "https://unfccc.int/es" },
    ]);
  }, []);

  return (
    <main className="p-10 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950">
      <h1 className="text-2xl font-bold text-green-400 mb-10 text-center">
        🔗 Enlaces de Interés
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {enlaces.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="backdrop-blur-md bg-green-800/30 h-32 rounded-xl border border-green-500/20 animate-pulse"
              ></div>
            ))
          : enlaces.map((e, idx) => (
              <div
                key={idx}
                className="backdrop-blur-md bg-green-800/40 p-6 rounded-xl shadow-lg border border-green-500/20 hover:border-green-400/40 transition"
              >
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-200 hover:text-green-100 text-lg font-semibold underline"
                >
                  {e.titulo}
                </a>
              </div>
            ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/info"
          className="px-6 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white shadow-md"
        >
          ← Volver a Información
        </Link>
      </div>
    </main>
  );
}
