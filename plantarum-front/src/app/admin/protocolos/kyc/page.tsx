"use client";

import { useState } from "react";
import Link from "next/link";
import { useKYC } from "@/hooks/usePlantarumKyc";

export default function KycPage() {
  const { registerKYC, isKYCVerified, revokeKYC, getKYCStatus, loading } =
    useKYC();

  const [user, setUser] = useState("");
  const [hashId, setHashId] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      await registerKYC(user, hashId);
      setMessage(`✅ KYC registrado para ${user}`);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  const handleVerify = async () => {
    try {
      const verified = await isKYCVerified(user);
      setMessage(verified ? "✅ Usuario verificado" : "⚠️ Usuario NO verificado");
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  const handleStatus = async () => {
    try {
      const status = await getKYCStatus(user);
      setMessage(`📌 Estado actual de ${user}: ${status}`);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeKYC(user);
      setMessage(`🗑️ KYC revocado para ${user}`);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <main className="p-10 min-h-screen">
      <h2 className="text-3xl font-bold text-green-400 text-center mb-6">
        🛡️ KYC – Verificación de Identidad Descentralizada
      </h2>
      <p className="text-green-200 text-center mb-10">
        Prueba de registro y validación KYC en la DAO Plantarum.
      </p>

      <div className="bg-green-900 p-8 rounded-2xl max-w-2xl mx-auto shadow-lg flex flex-col gap-6">
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Dirección del usuario"
          className="input-dark w-full"
        />

        <input
          type="text"
          value={hashId}
          onChange={(e) => setHashId(e.target.value)}
          placeholder="Hash de documentos (off-chain)"
          className="input-dark w-full"
        />

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-green flex-1"
          >
            Registrar
          </button>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn-green flex-1"
          >
            Verificar
          </button>
          <button
            onClick={handleStatus}
            disabled={loading}
            className="btn-green flex-1"
          >
            Estado
          </button>
          <button
            onClick={handleRevoke}
            disabled={loading}
            className="btn-red flex-1"
          >
            Revocar
          </button>
        </div>

        {message && <p className="text-center text-yellow-300 mt-4">{message}</p>}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver al Home
        </Link>
      </div>
    </main>
  );
}
