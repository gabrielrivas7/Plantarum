//src/app/reputation/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useReputation } from "@/hooks/usePlantarumReputation";

export default function ReputationPage() {
  const { getReputation, increaseReputation, decreaseReputation, loading } =
    useReputation();

  const [user, setUser] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleCheck = async () => {
    try {
      const rep = await getReputation(user);
      setMessage(`🔎 Reputación actual de ${user}: ${rep.toString()}`);
    } catch (err: any) {
      setMessage("❌ Error al consultar: " + err.message);
    }
  };

  const handleIncrease = async () => {
    try {
      await increaseReputation(user, parseInt(amount));
      setMessage(`✅ Reputación aumentada en ${amount}`);
    } catch (err: any) {
      setMessage("❌ Error al aumentar: " + err.message);
    }
  };

  const handleDecrease = async () => {
    try {
      await decreaseReputation(user, parseInt(amount));
      setMessage(`✅ Reputación reducida en ${amount}`);
    } catch (err: any) {
      setMessage("❌ Error al disminuir: " + err.message);
    }
  };

  return (
    <main className="p-10 min-h-screen">
      <h2 className="text-3xl font-bold text-green-400 text-center mb-6">
        ⭐ Sistema de Reputación
      </h2>
      <p className="text-green-200 text-center mb-10">
        Consulta y modifica la reputación de miembros desde la DAO.
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
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Cantidad"
          className="input-dark w-full"
        />

        <div className="flex gap-4">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="btn-green flex-1"
          >
            🔎 Consultar
          </button>
          <button
            onClick={handleIncrease}
            disabled={loading}
            className="btn-green flex-1"
          >
            ⬆️ Aumentar
          </button>
          <button
            onClick={handleDecrease}
            disabled={loading}
            className="btn-red flex-1"
          >
            ⬇️ Disminuir
          </button>
        </div>

        {message && (
          <p className="text-center text-yellow-300 mt-4">{message}</p>
        )}
      </div>

      {/* Botón volver */}
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
