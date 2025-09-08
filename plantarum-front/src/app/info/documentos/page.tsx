// src/app/info/documentos/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Documento {
  titulo: string;
  url: string;
  fecha: string;
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  useEffect(() => {
    setDocumentos([
      {
        titulo: "Informe Forestal 2025",
        url: "/docs/informe-forestal-2025.pdf",
        fecha: "2025-08-10",
      },
      {
        titulo: "Estudio de Impacto Ambiental",
        url: "/docs/impacto-ambiental.pdf",
        fecha: "2025-07-22",
      },
      {
        titulo: "Guía de Créditos de Carbono",
        url: "/docs/creditos-carbono.pdf",
        fecha: "2025-06-15",
      },
    ]);
  }, []);

  return (
    <main className="p-10 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950">
      <h1 className="text-2xl font-bold text-green-400 mb-10 text-center">
        📑 Documentos Forestales
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {documentos.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="backdrop-blur-md bg-green-800/30 h-40 rounded-xl border border-green-500/20 animate-pulse"
              ></div>
            ))
          : documentos.map((doc, idx) => (
              <div
                key={idx}
                className="backdrop-blur-md bg-green-800/40 p-6 rounded-xl shadow-lg border border-green-500/20 hover:border-green-400/40 transition flex flex-col justify-between h-48"
              >
                <div>
                  <h3 className="text-green-200 font-semibold text-lg">{doc.titulo}</h3>
                  <p className="text-sm text-green-300 mt-1">
                    📅 {new Date(doc.fecha).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-center shadow"
                >
                  📥 Descargar
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
