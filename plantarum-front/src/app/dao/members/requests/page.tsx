// src/app/dao/members/requests/page.tsx
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

export default function MemberRequestsPage() {
  const { getAllMembers } = usePlantarumDao();
  const { account } = useWallet();
  const [requests, setRequests] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRequests = async () => {
      if (!account) return;
      try {
        setLoading(true);
        const result = await getAllMembers();

        // 🔹 Filtrar solicitudes pendientes (o suspendidas si se requiere moderación)
        const pending = result.filter(
          (m: Member) =>
            m.status.toLowerCase() === "pendiente" ||
            m.status.toLowerCase() === "suspendido"
        );

        setRequests(pending);
      } catch (err) {
        console.error("❌ Error cargando solicitudes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [account, getAllMembers]);

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        📨 Solicitudes Pendientes
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
        <Link href="/dao/members/list" className="btn-green">
          Miembros
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-green-300">⏳ Cargando solicitudes...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-400">
          ✅ No hay solicitudes pendientes.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {requests.map((m, idx) => (
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
              {/* Avatar */}
              <div
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
              </div>

              {/* Info */}
              <div style={{ flex: 1, marginLeft: "16px" }}>
                <p style={{ color: "#bbf7d0", fontWeight: "bold" }}>
                  {m.aliasName || "Sin alias"}
                </p>
                <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                  {m.personaType} – {m.memberType}
                </p>
                <p style={{ color: "#6ee7b7", fontSize: "0.8rem" }}>
                  {m.wallet}
                </p>
              </div>

              {/* Estado */}
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  color:
                    m.status.toLowerCase() === "pendiente"
                      ? "#f59e0b"
                      : "#f87171",
                  border: `1px solid ${
                    m.status.toLowerCase() === "pendiente"
                      ? "#f59e0b"
                      : "#f87171"
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
