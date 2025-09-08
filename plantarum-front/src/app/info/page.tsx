// src/app/info/page.tsx
"use client";

import Link from "next/link";

export default function InfoPage() {
  return (
    <main className="p-10 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950">
      <h1 className="text-3xl font-bold text-center text-green-400 mb-12">
        📚 Centro de Información Plantarum
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {[
          {
            title: "🔗 Enlaces de interés",
            text: "Aquí aparecerán los enlaces publicados desde el panel de administración.",
            href: "/info/enlaces",
            button: "Ver enlaces →",
          },
          {
            title: "🌲 Documentos Forestales",
            text: "Archivos PDF y material técnico que se publiquen desde el panel admin.",
            href: "/info/documentos",
            button: "Ver documentos →",
          },
          {
            title: "📖 Plantarum Docs",
            text: "Documentación oficial de la plataforma, cargada desde Admin.",
            href: "/info/docs",
            button: "Ver documentación →",
          },
          {
            title: "🎓 Trabajo Final de Máster",
            text: "Publicaciones y archivos relacionados con el TFM.",
            href: "/info/tfm",
            button: "Ver TFM →",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="backdrop-blur-md bg-green-800/40 p-10 h-64 rounded-2xl shadow-xl border border-green-500/20 hover:border-green-400/40 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
          >
            <h2 className="text-2xl font-bold text-green-300">{card.title}</h2>
            <p className="text-green-100/90 flex-grow mt-2">{card.text}</p>
            <Link
              href={card.href}
              className="inline-block px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-md transition"
            >
              {card.button}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
