"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlantarumDao } from "../../../../../hooks/usePlantarumDao";
import { useWallet } from "../../../../context/WalletContext";

interface Member {
  wallet: string;
  aliasName: string;
  personaType: string;
  memberType: string;
  status: string;
  image: string;
  joinedAt: number;
}

export default function MembersListPage() {
  const { getAllMembers } = usePlantarumDao();
  const { account } = useWallet();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      if (!account) {
        setLoading(false);
        return;
      }
      try {
        const result = await getAllMembers();
        setMembers(result);
      } catch (err) {
        console.error("❌ Error cargando miembros:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, [account, getAllMembers]);

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        📋 Lista de Miembros
      </h2>

      {/* Botones navegación */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Link href="/dao" className="btn-green">
        🏛️ DAO
        </Link>
        <Link href="/dao/members" className="btn-green">
          Formulario
        </Link>
        <Link href="/dao/members/requests" className="btn-green">
          Solicitudes en proceso
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-green-300">⏳ Cargando miembros...</p>
      ) : members.length === 0 ? (
        <p className="text-center text-gray-400">
          ⚠️ No hay miembros registrados aún.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {members.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1e293b",
                border: "2px solid #22c55e",
                borderRadius: "12px",
                padding: "16px 24px",
                boxShadow: "0 0 10px rgba(34, 197, 94, 0.3)",
              }}
            >
              {/* Avatar con link */}
              <Link
                href={`/dao/members/${m.wallet}`}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#064e3b",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {m.image && m.image.startsWith("ipfs://") ? (
                  <img
                    src={m.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    alt="avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#22c55e" }}>
                    DAO
                  </span>
                )}
              </Link>

              {/* Info */}
              <div style={{ flex: 1, marginLeft: "16px" }}>
                <Link
                  href={`/dao/members/${m.wallet}`}
                  style={{
                    color: "#bbf7d0",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  {m.aliasName || "Sin alias"}
                </Link>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                  {m.personaType} – {m.memberType}
                </p>
                <p style={{ color: "#6ee7b7", fontSize: "0.8rem" }}>
                  {m.wallet}
                </p>
              </div>

              {/* Estado siempre visible */}
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  color: m.status === "Activo" ? "#22c55e" : "#facc15",
                  border: `1px solid ${
                    m.status === "Activo" ? "#22c55e" : "#facc15"
                  }`,
                }}
              >
                {m.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

