// src/app/dao/propose/proposals/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlantarumDao } from "../../../../../hooks/usePlantarumDao";

interface Proposal {
  id: bigint;
  title: string;
  proposalType: string;
  status: string;
  createdAt: bigint;
  deadline: bigint;
  hashId: string;
}

export default function ProposalsListPage() {
  const { getAllProposals } = usePlantarumDao();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setLoading(true);
        const result = await getAllProposals();

        // ✅ Filtramos propuestas eliminadas (id = 0 o título vacío)
        const filtered = result.filter(
          (p: any) =>
            p.id !== 0n &&
            p.title &&
            p.title.trim() !== "" &&
            Number(p.createdAt) > 0 &&
            Number(p.deadline) > 0
        );

        setProposals(filtered);
      } catch (err) {
        console.error("❌ Error cargando propuestas:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProposals();
  }, [getAllProposals]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "vigente":
        return { color: "#facc15", label: "🟡 Vigente" };
      case "aceptada":
        return { color: "#4ade80", label: "🟢 Aceptada" };
      case "rechazada":
        return { color: "#f87171", label: "🔴 Rechazada" };
      default:
        return { color: "#9ca3af", label: status };
    }
  };

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        📑 Propuestas Registradas
      </h2>

      {/* 🔹 Menú de navegación */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      > <Link href="/dao" className="btn-green">
        🏛️ DAO
        </Link>
        <Link href="/dao/propose" className="btn-green">
          📝 Crear Propuesta
        </Link>
        <Link href="/dao/vote" className="btn-green">
          🗳️ Votar
        </Link>
        <Link href="/dao/results" className="btn-green">
          📊 Resultados
        </Link>
        <Link href="/dao/execute" className="btn-green">
          ⚡ Ejecutar
        </Link>
      </div>

      {/* 🔹 Listado de propuestas */}
      {loading ? (
        <p className="text-center text-green-300">⏳ Cargando propuestas...</p>
      ) : proposals.length === 0 ? (
        <p className="text-center text-gray-400">
          ⚠️ No hay propuestas registradas aún.
        </p>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {proposals.map((p, idx) => {
            const { color, label } = getStatusStyle(p.status);

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "#111",
                  border: "2px solid #22c55e",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 0 12px rgba(0,255,157,0.4)",
                }}
              >
                {/* Info izquierda */}
                <div style={{ flex: 3 }}>
                  <h3 className="text-green-300 text-lg font-bold mb-2">
                    <Link
                      href={`/dao/propose/${p.id.toString()}`}
                      style={{ color: "#22c55e", textDecoration: "none" }}
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-300">
                    Tipo: {p.proposalType}
                  </p>
                  <p className="text-sm text-gray-400">
                    Creado:{" "}
                    {new Date(Number(p.createdAt) * 1000)
                      .toISOString()
                      .split("T")[0]}{" "}
                    – Vence:{" "}
                    {new Date(Number(p.deadline) * 1000)
                      .toISOString()
                      .split("T")[0]}
                  </p>
                  <p className="text-xs text-gray-500">HashID: {p.hashId}</p>
                </div>

                {/* 🔹 Estatus derecha grande */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: "18px",
                    color,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

