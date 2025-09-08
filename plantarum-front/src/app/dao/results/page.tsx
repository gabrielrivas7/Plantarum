// src/app/dao/results/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlantarumDao } from "../../../../hooks/usePlantarumDao";
import { useWallet } from "../../../context/WalletContext";

interface Proposal {
  id: bigint;
  title: string;
  proposalType: string;
  status: string;
  createdAt: bigint;
  deadline: bigint;
  votesFor: bigint;
  votesAgainst: bigint;
}

export default function ResultsPage() {
  const { getAllProposals, executeProposal } = usePlantarumDao();
  const { account } = useWallet();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar propuestas
  useEffect(() => {
    const load = async () => {
      try {
        const result = await getAllProposals();

        // ✅ Filtramos propuestas eliminadas o inválidas
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
      }
    };
    load();
  }, [account, getAllProposals]);

  const handleExecute = async (id: bigint) => {
    if (!account) {
      alert("⚠️ Conecta tu wallet primero");
      return;
    }
    try {
      setLoading(true);
      await executeProposal(id);
      alert("✅ Propuesta ejecutada");
    } catch (err) {
      console.error(err);
      alert("❌ Error al ejecutar propuesta");
    } finally {
      setLoading(false);
    }
  };

  const canExecute = (p: Proposal) => {
    const now = Math.floor(Date.now() / 1000);
    return p.status === "vigente" && Number(p.deadline) < now;
  };

  return (
    <main style={{ padding: "24px" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        📊 Resultados de Propuestas
      </h2>

      {/* 🔹 Flecha de regreso */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/dao"
          className="text-green-400 hover:text-green-300 flex items-center gap-2"
        >
          ← Volver a la DAO
        </Link>
      </div>

      <p className="text-center max-w-2xl mb-8">
        Consulta el estado final de las propuestas votadas en la DAO.
      </p>

      {proposals.length === 0 ? (
        <p className="text-center text-gray-400">
          ⚠️ No hay propuestas aún.
        </p>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {proposals.map((p) => (
            <div
              key={Number(p.id)}
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
              <div style={{ flex: 2 }}>
                <h3 className="text-green-300 text-lg font-bold mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-300">
                  Tipo: {p.proposalType}
                </p>
                <p className="text-sm text-gray-400">
                  Fecha de cierre:{" "}
                  {new Date(Number(p.deadline) * 1000).toLocaleDateString()}
                </p>

                {/* Votos */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    marginTop: "12px",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ color: "#22c55e" }}>
                    👍 A favor: {Number(p.votesFor)}
                  </p>
                  <p style={{ color: "#ef4444" }}>
                    👎 En contra: {Number(p.votesAgainst)}
                  </p>
                </div>
              </div>

              {/* Estatus derecha */}
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                <p
                  style={{
                    fontSize: "1.2rem",
                    color:
                      p.status === "aceptada"
                        ? "#22c55e"
                        : p.status === "rechazada"
                        ? "#ef4444"
                        : "#f59e0b",
                  }}
                >
                  {p.status.toUpperCase()}
                </p>

                {/* ✅ Botón ejecutar solo si está vencida y vigente */}
                {canExecute(p) && (
                  <button
                    onClick={() => handleExecute(p.id)}
                    disabled={loading}
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#2563eb",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  >
                    ⚡ Ejecutar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

