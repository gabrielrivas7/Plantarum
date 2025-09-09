// src/app/admin/protocolos/page.tsx
"use client";

import Link from "next/link";

export default function ProtocolosPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h1 className="text-3xl font-extrabold text-green-400 text-center mb-10">
        🛡️ Protocolos de Protección
      </h1>
      <p className="text-center max-w-2xl mb-12">
        Accede a los protocolos críticos del ecosistema{" "}
        <span className="text-green-400 font-bold">Plantarum</span>: identidad,
        protección de datos, reputación y prueba de reserva forestal.
      </p>

      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <Link href="/admin/protocolos/kyc" className="card">
            <div className="card-title">🧾 KYC</div>
            <p className="card-text">
              Verificación de identidad descentralizada.
            </p>
          </Link>

          <Link href="/admin/protocolos/rgpd" className="card">
            <div className="card-title">🔒 RGPD</div>
            <p className="card-text">
              Protección de datos y derecho al olvido.
            </p>
          </Link>
        </div>

        {/* Segunda fila */}
        <div className="card-row">
          <Link href="/admin/protocolos/reputation" className="card">
            <div className="card-title">⭐ Reputation</div>
            <p className="card-text">
              Sistema de reputación y confianza.
            </p>
          </Link>

          <Link href="/admin/protocolos/prf" className="card">
            <div className="card-title">🌳 PRF</div>
            <p className="card-text">
              Protocolo de Prueba de Reserva Forestal con auditores
              descentralizados.
            </p>
          </Link>
        </div>
      </div>

      {/* Botón volver */}
      <div className="mt-12 flex justify-center">
        <Link
          href="/admin"
          className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white shadow-md"
        >
          ← Volver al Admin
        </Link>
      </div>
    </main>
  );
}
