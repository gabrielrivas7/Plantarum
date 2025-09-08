// src/app/dao/propose/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePlantarumDao } from "../../../../../hooks/usePlantarumDao";

interface Proposal {
  id: bigint;
  creator: string;
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

export default function ProposalProfile() {
  const { id } = useParams();
  const { getProposalById } = usePlantarumDao();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProposal = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const result = await getProposalById(BigInt(id as string));
        setProposal(result);
      } catch (err) {
        console.error("❌ Error cargando propuesta:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProposal();
  }, [id, getProposalById]);

  if (loading) {
    return (
      <main style={{ padding: "24px", minHeight: "80vh" }}>
        <h2 className="text-xl text-center text-green-400">⏳ Cargando propuesta...</h2>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main style={{ padding: "24px", minHeight: "80vh" }}>
        <h2 className="text-2xl font-bold text-center text-red-400">
          ❌ Propuesta no encontrada
        </h2>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <div
        style={{
          backgroundColor: "#111",
          border: "2px solid #22c55e",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "900px",
          margin: "0 auto",
          boxShadow: "0 0 12px rgba(0,255,157,0.4)",
        }}
      >
        <h2 className="text-2xl font-bold mb-4 text-green-400 text-center">
          {proposal.title}
        </h2>

        <p className="text-gray-300 mb-2">
          <strong>Tipo:</strong> {proposal.proposalType}
        </p>
        <p className="text-gray-300 mb-2">
          <strong>Fecha de creación:</strong>{" "}
          {new Date(Number(proposal.createdAt) * 1000).toLocaleDateString()}
        </p>
        <p className="text-gray-300 mb-2">
          <strong>Fecha límite:</strong>{" "}
          {new Date(Number(proposal.deadline) * 1000).toLocaleDateString()}
        </p>
        <p className="text-gray-300 mb-4">
          <strong>HashID:</strong> {proposal.hashId}
        </p>

        <p className="text-gray-200 mb-6">{proposal.description}</p>

        {proposal.fileHash && (
          <p className="text-green-400">
            📄 Documento técnico:{" "}
            <a
              href={`https://ipfs.io/ipfs/${proposal.fileHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              Ver PDF
            </a>
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>✅ Votos a favor: {proposal.votesFor.toString()}</p>
          <p>❌ Votos en contra: {proposal.votesAgainst.toString()}</p>
          <p>👤 Creador: {proposal.creator}</p>
          <p>📌 Estado: {proposal.status}</p>
        </div>
      </div>

      {/* 🔹 Navegación circular al pie */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "32px",
        }}
      >
        <Link href="/dao" className="btn-green">🏛️ DAO</Link>
        <Link href="/dao/propose/proposals" className="btn-green">📑 Propuestas</Link>
        <Link href="/dao/propose" className="btn-green">📝 Crear Propuesta</Link>
        <Link href="/dao/vote" className="btn-green">🗳️ Votar</Link>
      </div>
    </main>
  );
}




