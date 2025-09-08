//src/app/info/plantarumdocs/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Documento {
  titulo: string;
  url: string;
  fecha: string;
}

export default function PlantarumDocsPage() {
  const [docs, setDocs] = useState<Documento[]>([]);

  useEffect(() => {
    // 🔹 Simulación inicial, después se conectará al middleware
    setDocs([
      {
        titulo: "Whitepaper Plantarum",
        url: "/docs/whitepaper-plantarum.pdf",
        fecha: "2025-05-01",
      },
      {
        titulo: "Manual DAO Plantarum",
        url: "/docs/manual-dao.pdf",
        fecha: "2025-06-10",
      },
    ]);
  }, []);

  return (
    <main className="p-10 min-h-screen bg-green-950">
      <h1 className="text-2xl font-bold text-green-400 mb-6 text-center">
        📘 Plantarum Docs
      </h1>

      {docs.length === 0 ? (
        <p className="text-green-200 text-center">⚠️ No hay documentos aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="bg-green-800 p-5 rounded-xl shadow-md border border-green-500/30 hover:border-green-400 transition flex flex-col justify-between"
            >
              <h3 className="text-green-200 font-semibold mb-2">{doc.titulo}</h3>
              <p className="text-sm text-green-300">
                📅 {new Date(doc.fecha).toLocaleDateString()}
              </p>
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
      )}

      {/* Botón volver */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/info"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver a Información
        </Link>
      </div>
    </main>
  );
}
