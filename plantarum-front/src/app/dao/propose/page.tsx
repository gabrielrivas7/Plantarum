// src/app/dao/propose/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlantarumDao } from "../../../../hooks/usePlantarumDao";
import { useWallet } from "../../../context/WalletContext";
import axios from "axios";

export default function ProposePage() {
  const { createProposal } = usePlantarumDao();
  const { account } = useWallet();

  const [title, setTitle] = useState("");
  const [proposalType, setProposalType] = useState("");
  const [description, setDescription] = useState("");
  const [fileHash, setFileHash] = useState(""); 
  const [durationIndex, setDurationIndex] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage("⚠️ Solo se permiten archivos PDF.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("⚠️ El archivo no puede superar los 5MB.");
      e.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:4000/ipfs/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFileHash(res.data.IpfsHash);
      setMessage("✅ Archivo subido a IPFS.");
    } catch (err) {
      console.error("❌ Error subiendo archivo a IPFS:", err);
      setMessage("❌ Error al subir archivo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setMessage("⚠️ Conecta tu wallet primero.");
      return;
    }
    if (!fileHash) {
      setMessage("⚠️ Debes subir un archivo PDF válido.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Creando propuesta...");

      const tx = await createProposal(
        title,
        description,
        proposalType,
        fileHash,
        BigInt(durationIndex),
        "hashid-" + Date.now().toString()
      );

      setMessage("✅ Propuesta creada correctamente. TX: " + tx);
      setTitle("");
      setProposalType("");
      setDescription("");
      setFileHash("");
      setDurationIndex("0");
    } catch (err: any) {
      console.error("Error al crear propuesta:", err);
      setMessage("❌ Error al crear la propuesta: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        📝 Crear Propuesta
      </h2>

      {/* 🔹 Flecha de regreso */}
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dao" className="text-green-400 hover:text-green-300 flex items-center gap-2">
          ← Volver a la DAO
        </Link>
      </div>

      <p className="text-center max-w-2xl mb-8">
        Aquí puedes registrar nuevas propuestas para que sean evaluadas por la comunidad.
      </p>

      <div
        style={{
          backgroundColor: "#064e3b",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Título de la propuesta" className="input-dark" style={{ color: "#fff" }} required />

          <select value={proposalType} onChange={(e) => setProposalType(e.target.value)} className="input-dark" style={{ color: "#fff" }} required>
            <option value="">Selecciona tipo de propuesta</option>
            <option>General</option>
            <option>Técnica</option>
            <option>Tecnológica</option>
            <option>Web3</option>
            <option>Conservación</option>
            <option>Tesorería</option>
            <option>Economía</option>
            <option>Proyectos</option>
            <option>Comités</option>
          </select>

          <input type="file" accept=".pdf" onChange={handleFileChange} className="input-dark" style={{ color: "#fff" }} />

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explica tu propuesta (máx 300 palabras)" className="input-dark" style={{ minHeight: "120px", resize: "vertical", color: "#fff" }} required />

          <label className="text-green-300 font-semibold">
            Escoja la Vigencia de la Propuesta
          </label>
          <select
            value={durationIndex}
            onChange={(e) => setDurationIndex(e.target.value)}
            className="input-dark"
            style={{ color: "#fff" }}
            required
          >
            <option value="0">1 día</option>
            <option value="1">2 días</option>
            <option value="2">3 días</option>
            <option value="3">7 días</option>
            <option value="4">14 días</option>
            <option value="5">21 días</option>
          </select>
          
          <button type="submit" className="btn-green w-full mt-4" disabled={loading}>
            {loading ? "⏳ Creando..." : "🚀 Crear Propuesta"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4" style={{ color: message.startsWith("✅") ? "#4ade80" : message.startsWith("⚠️") ? "#facc15" : message.startsWith("❌") ? "#f87171" : "#22c55e" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}






           