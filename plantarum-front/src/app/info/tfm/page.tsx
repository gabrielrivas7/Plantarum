"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Documento {
  titulo: string;
  url: string;
  fecha: string;
}

export default function LegalPage() {
  const [docs, setDocs] = useState<Documento[]>([]);

  useEffect(() => {
    setDocs([
      {
        titulo: "Marco Legal - Estatutos DAO",
        url: "/docs/marco-legal-dao.pdf",
        fecha: "2025-09-01",
      },
      {
        titulo: "Política de Privacidad y RGPD",
        url: "/docs/politica-privacidad.pdf",
        fecha: "2025-09-03",
      },
    ]);
  }, []);

  return (
    <main className="p-10 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950">
      <h1 className="text-3xl font-bold text-green-400 mb-12 text-center">
        ⚖️ Documentos Legales
      </h1>

      {docs.length === 0 ? (
        <p className="text-green-200 text-center">⚠️ No hay documentos legales aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="backdrop-blur-lg bg-green-800/40 p-8 rounded-2xl shadow-lg border border-green-500/20 hover:border-green-400/40 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
            >
              <h3 className="text-green-200 font-semibold text-xl mb-3">{doc.titulo}</h3>
              <p className="text-sm text-green-300 mb-4">
                📅 {new Date(doc.fecha).toLocaleDateString()}
              </p>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-center shadow"
              >
                📥 Descargar
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Botón volver */}
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
