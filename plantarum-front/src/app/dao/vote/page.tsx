// src/app/dao/vote/page.tsx 

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlantarumDao } from "../../../../hooks/usePlantarumDao";
import { useWallet } from "../../../context/WalletContext";

interface Proposal {
  id: bigint;
  title: string;
  description: string;
  proposalType: string;
  fileHash: string;
  status: string;
  createdAt: bigint;
  deadline: bigint;
  hashId: string;
  votesFor: bigint;
  votesAgainst: bigint;
}

export default function VotePage() {
  const { getAllProposals, voteProposal } = usePlantarumDao();
  const { account } = useWallet();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Reloj en vivo para countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Cargar propuestas (siempre, con o sin wallet)
  const loadProposals = async () => {
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

      // ✅ Solo mostramos vigentes aquí
      const vigentes = filtered.filter((p: any) => p.status === "vigente");
      setProposals(vigentes);
    } catch (err) {
      console.error("❌ Error cargando propuestas:", err);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [account, getAllProposals]);

  const calculateTimeLeft = (deadline: bigint) => {
    const diff = Number(deadline) * 1000 - now;
    if (diff <= 0) return "⏳ Finalizada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleVote = async (id: bigint, support: boolean) => {
    if (!account) {
      setMessage("⚠️ Conecta tu wallet primero.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Enviando voto...");
      await voteProposal(id, support);

      // 🔄 Refrescar propuestas después de votar
      await loadProposals();

      setMessage(
        `✅ Has votado ${support ? "A Favor" : "En Contra"} en la propuesta ${Number(
          id
        )}`
      );
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Ya votaste")) {
        setMessage("⚠️ Ya has votado en esta propuesta.");
      } else if (err.message?.includes("caducada")) {
        setMessage("⚠️ La propuesta ya está caducada.");
      } else {
        setMessage("❌ Error al votar la propuesta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        🗳️ Votar Propuestas
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

      {/* 🔹 Mensajes */}
      {message && (
        <p
          className="text-center mb-6"
          style={{
            color: message.startsWith("✅")
              ? "#4ade80"
              : message.startsWith("⚠️")
              ? "#facc15"
              : message.startsWith("❌")
              ? "#f87171"
              : "#22c55e",
          }}
        >
          {message}
        </p>
      )}

      {proposals.length === 0 ? (
        <p className="text-center text-gray-400">
          ⚠️ No hay propuestas vigentes.
        </p>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {proposals.map((proposal) => (
            <div
              key={Number(proposal.id)}
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
                  {proposal.title}
                </h3>
                <p className="text-sm text-gray-300">
                  Tipo: {proposal.proposalType}
                </p>
                <p className="text-sm text-gray-400">
                  Creada:{" "}
                  {new Date(Number(proposal.createdAt) * 1000).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Vence:{" "}
                  {new Date(Number(proposal.deadline) * 1000).toLocaleDateString()}
                </p>

                {/* Botones de votación */}
                {account ? (
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={loading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#065f46",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    >
                      👍 A Favor
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={loading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#7f1d1d",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    >
                      👎 En Contra
                    </button>
                  </div>
                ) : (
                  <p className="text-yellow-400 mt-2 italic">
                    ⚠️ Conecta tu wallet para votar
                  </p>
                )}
              </div>

              {/* Estatus + Cronómetro derecha */}
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#facc15", // Amarillo para "vigente"
                }}
              >
                <p style={{ fontSize: "1.4rem" }}>
                  🟡 {proposal.status.toUpperCase()}
                </p>
                <p className="text-sm text-gray-400">VENCE EN</p>
                <p style={{ fontSize: "1.2rem" }}>
                  {calculateTimeLeft(proposal.deadline)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}




