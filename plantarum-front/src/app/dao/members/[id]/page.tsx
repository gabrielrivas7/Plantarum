// src/app/dao/members/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePlantarumDao } from "../../../../../hooks/usePlantarumDao";

interface Member {
  wallet: string;
  aliasName: string;
  personaType: string;
  memberType: string;
  status: string;
  image: string;
  joinedAt: number;
}

export default function MemberProfilePage() {
  const { id } = useParams(); // aquí id es la address del miembro
  const { getMemberById } = usePlantarumDao();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMember = async () => {
      if (!id) return;
      try {
        const result = await getMemberById(id as string);
        setMember(result);
      } catch (err) {
        console.error("❌ Error cargando miembro:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMember();
  }, [id, getMemberById]);

  if (loading) {
    return <p className="text-center text-green-300 mt-6">⏳ Cargando perfil...</p>;
  }

  if (!member) {
    return <p className="text-center text-red-400 mt-6">⚠️ Miembro no encontrado.</p>;
  }

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        👤 Perfil del Miembro
      </h2>

      <div
        style={{
          backgroundColor: "#111",
          border: "2px solid #22c55e",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 0 15px rgba(34,197,94,0.3)",
        }}
      >
        {/* Imagen */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {member.image && member.image.startsWith("ipfs://") ? (
            <img
              src={member.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
              alt="avatar"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                margin: "0 auto",
                border: "3px solid #22c55e",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "#064e3b",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "2rem",
                color: "#22c55e",
                border: "3px dashed #22c55e",
              }}
            >
              DAO
            </div>
          )}
        </div>

        {/* Datos */}
        <h3 className="text-green-300 text-xl font-bold text-center mb-4">
          {member.aliasName || "Sin alias"}
        </h3>
        <p className="text-gray-300 text-center mb-2">
          {member.personaType} – {member.memberType}
        </p>
        <p className="text-gray-400 text-center mb-2">
          Estado:{" "}
          <span
            style={{
              color: member.status === "Activo" ? "#22c55e" : "#f87171",
              fontWeight: "bold",
            }}
          >
            {member.status}
          </span>
        </p>
        <p className="text-gray-400 text-center mb-2">
          Wallet: <span className="text-green-400">{member.wallet}</span>
        </p>
        <p className="text-gray-500 text-center">
          Se unió el: {new Date(Number(member.joinedAt) * 1000).toLocaleDateString()}
        </p>
      </div>

      {/* 🔹 Botones navegación circular */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <Link href="/dao/members" className="btn-green">
          ⬅️ Volver a Formulario
        </Link>
        <Link href="/dao/members/list" className="btn-green">
          📋 Volver a Lista
        </Link>
      </div>
    </main>
  );
}
