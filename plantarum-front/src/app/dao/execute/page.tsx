// src/app/dao/execute/page.tsx 

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

export default function ExecutePage() {
  const { getAllProposals, executeProposal } = usePlantarumDao();
  const { account } = useWallet();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Cargar propuestas siempre, con o sin wallet
  const loadProposals = async () => {
    try {
      const result = await getAllProposals();

      // Filtrar propuestas inválidas
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

  useEffect(() => {
    loadProposals();
  }, [account, getAllProposals]);

  const handleExecute = async (id: bigint) => {
    if (!account) {
      setMessage("⚠️ Conecta tu wallet primero.");
      return;
    }

    try {
      setLoading(true);
      await executeProposal(id);
      setMessage(`✅ Propuesta ${Number(id)} ejecutada correctamente.`);
      loadProposals();
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error al ejecutar la propuesta. ¿Tienes el rol adecuado?");
    } finally {
      setLoading(false);
    }
  };

  const isExecutable = (p: Proposal) => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    return p.status === "vigente" && Number(p.deadline) < nowSeconds;
  };

  return (
    <main style={{ padding: "24px" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        ⚡ Ejecutar Propuestas
      </h2>
      <p className="text-center mb-8 text-gray-300">
        Solo el <span className="text-green-400 font-bold">SuperAdmin</span> puede ejecutar propuestas. Futuramente será multisig.
      </p>

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
          style={{ color: message.startsWith("✅") ? "#4ade80" : "#f87171" }}
        >
          {message}
        </p>
      )}

      {proposals.length === 0 ? (
        <p className="text-center text-gray-400">⚠️ No hay propuestas disponibles.</p>
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
                boxShadow: "0 0 12px rgba(0,255,157,0.4)",
              }}
            >
              <h3 className="text-green-300 text-lg font-bold mb-2">
                {proposal.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Creada:{" "}
                {new Date(Number(proposal.createdAt) * 1000).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Venció:{" "}
                {new Date(Number(proposal.deadline) * 1000).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-300 mb-4">
                Estado actual: <span className="font-bold">{proposal.status}</span>
              </p>

              {isExecutable(proposal) ? (
                account ? (
                  <button
                    onClick={() => handleExecute(proposal.id)}
                    disabled={loading}
                    style={{
                      marginTop: "12px",
                      padding: "10px 20px",
                      backgroundColor: "#15803d",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  >
                    ⚡ Ejecutar Propuesta
                  </button>
                ) : (
                  <p className="text-yellow-400 italic">
                    Conecta tu wallet para ejecutar
                  </p>
                )
              ) : (
                <p className="text-red-400 italic">⏳ Aún no ejecutable</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
