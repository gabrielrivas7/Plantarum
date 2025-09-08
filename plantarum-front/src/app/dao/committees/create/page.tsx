// src/app/dao/committees/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlantarumDao } from "../../../../../hooks/usePlantarumDao";
import { useWallet } from "../../../../context/WalletContext";

export default function CreateCommitteePage() {
  const { createCommittee } = usePlantarumDao();
  const { account } = useWallet();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<string>(""); // 🔹 placeholder IPFS
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("⚠️ La imagen no puede superar los 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      setImage("ipfs://hash-demo"); // 🔹 luego se conecta a IPFS real
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setMessage("⚠️ Conecta tu wallet primero.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Creando comité en blockchain...");

      const tx = await createCommittee(name, description, image);
      if (tx) {
        setMessage("✅ Comité creado con éxito.");
      } else {
        setMessage("❌ Error al crear comité.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Hubo un error en la transacción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        ➕ Crear Comité
      </h2>

      <div
        style={{
          backgroundColor: "#064e3b",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Nombre del Comité"
            className="input-dark"
            style={{ color: "#fff" }}
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del Comité"
            className="input-dark"
            style={{ color: "#fff", minHeight: "100px" }}
            required
          />

          {/* Imagen */}
          <div style={{ textAlign: "center" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#bbf7d0",
              }}
            >
              Imagen del Comité (máx 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="input-dark"
              style={{ color: "#fff" }}
            />
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    border: "2px solid #22c55e",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "#064e3b",
                    border: "2px dashed #22c55e",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#22c55e",
                  }}
                >
                  Avatar
                </div>
              )}
            </div>
          </div>

          {/* Botón Crear Comité */}
          <button type="submit" className="btn-green w-full mt-4" disabled={loading}>
            {loading ? "⏳ Procesando..." : "🚀 Crear Comité"}
          </button>
           <button
          type="button"
          onClick={() => router.push("/dao/committees")}
          className="btn-green px-6 py-2"
        >
          🔙 Volver a Comités
        </button>
        </form>

        {message && <p className="text-center text-green-300 mt-4">{message}</p>}
      </div>

      {/* 🔹 Botón debajo, fuera del formulario */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
       
        {/* 🔹 Botón DAO  */}
          <button
            type="button"
            onClick={() => router.push("/dao")}
            className="btn-green px-6 py-2"
          >
            🏛️ Ir a la DAO
          </button>
      </div>
    </main>
  );
}
