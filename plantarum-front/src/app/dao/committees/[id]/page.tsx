// src/app/dao/committees/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlantarumDao } from "../../../../../hooks/usePlantarumDao";

interface Committee {
  id: bigint;
  name: string;
  description: string;
  status: string;
  image: string;
  createdAt: bigint;
}

export default function CommitteeProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getCommitteeById } = usePlantarumDao();
  const [committee, setCommittee] = useState<Committee | null>(null);

  useEffect(() => {
    const loadCommittee = async () => {
      try {
        if (!id) return;
        const data = await getCommitteeById(BigInt(id as string));
        setCommittee(data);
      } catch (err) {
        console.error("❌ Error cargando comité:", err);
      }
    };
    loadCommittee();
  }, [id, getCommitteeById]);

  if (!committee) {
    return (
      <main style={{ padding: "24px", minHeight: "80vh" }}>
        <p className="text-center text-green-300">⏳ Cargando comité...</p>
      </main>
    );
  }

  // 🔹 Resolver IPFS link
  const imageUrl = committee.image?.startsWith("ipfs://")
    ? committee.image.replace("ipfs://", "https://ipfs.io/ipfs/")
    : committee.image;

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        🏛️ Comité: {committee.name}
      </h2>

      <div
        style={{
          backgroundColor: "#064e3b",
          padding: "32px",
          borderRadius: "16px",
          maxWidth: "700px",
          margin: "0 auto",
          textAlign: "center",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        {/* Imagen */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={committee.name}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "2px solid #22c55e",
              objectFit: "cover",
              margin: "0 auto",
            }}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "#064e3b",
              border: "2px dashed #22c55e",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto",
              color: "#22c55e",
              fontSize: "0.9rem",
            }}
          >
            Sin Imagen
          </div>
        )}

        <h3 className="text-green-300 mt-4 text-xl">{committee.name}</h3>
        <p style={{ color: "#bbf7d0", marginTop: "12px" }}>
          {committee.description}
        </p>
        <p style={{ color: "#6ee7b7", marginTop: "8px" }}>
          Estado: {committee.status}
        </p>

        {/* Botones de acciones */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {/* Botón unirse (placeholder activo) */}
          <button
            onClick={() =>
              alert(
                "🚧 Función en desarrollo: en el futuro podrás unirte al comité con votación DAO."
              )
            }
            className="btn-green"
          >
            Unirme al Comité
          </button>

          {/* Link a metadata */}
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-green"
            >
              Ver Metadata
            </a>
          )}

          {/* Botón volver */}
          <button onClick={() => router.push("/dao/committees")} className="btn-green">
            🔙 Volver
          </button>
        </div>
      </div>
    </main>
  );
}
