// src/app/dao/committees/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlantarumCommittees } from "../../../../hooks/usePlantarumCommittees";
import { useWallet } from "../../../context/WalletContext";

interface Committee {
  id: bigint;
  name: string;
  description: string;
  createdAt: bigint;
  status: string;
  image: string;
}

export default function CommitteesPage() {
  const { getAllCommittees } = usePlantarumCommittees();
  const { account } = useWallet();

  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCommittees = async () => {
      if (!account) return;
      try {
        setLoading(true);
        const result = await getAllCommittees();
        setCommittees(result);
      } catch (err) {
        console.error("❌ Error cargando comités:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCommittees();
  }, [account, getAllCommittees]);

  return (
    <main style={{ padding: "24px" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">🏛️ Comités de la DAO</h2>
      <p className="text-center max-w-2xl mb-8">
        Los comités permiten organizar y descentralizar decisiones específicas. <br />
        En esta sección podrás consultar y crear comités especializados.
      </p>

      {/* 🔹 Flecha de regreso */}
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dao" className="text-green-400 hover:text-green-300 flex items-center gap-2">
          ← Volver a la DAO
        </Link>
      </div>

      {/* Listado de Comités */}
      {loading ? (
        <p className="text-center text-green-300">⏳ Cargando comités...</p>
      ) : committees.length === 0 ? (
        <p className="text-center text-gray-400">⚠️ No hay comités registrados aún.</p>
      ) : (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {committees.map((c) => (
            <div
              key={Number(c.id)}
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
              {/* Bloque izquierdo clickable */}
              <Link
                href={`/dao/committees/${Number(c.id)}`}
                style={{ flex: 3, textDecoration: "none" }}
              >
                <h3 className="text-green-300 text-lg font-bold mb-2 hover:underline">
                  {c.name}
                </h3>
                <p className="text-sm text-gray-300 mb-2">{c.description}</p>
                <p className="text-sm text-gray-400">
                  Creado el:{" "}
                  {new Date(Number(c.createdAt) * 1000).toLocaleDateString()}
                </p>
              </Link>

              {/* Estado */}
              <div style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: c.status === "Activo" ? "#22c55e" : "#f59e0b",
                  }}
                >
                  {c.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
