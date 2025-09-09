// src/app/rgpd/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRgpd } from "@/hooks/usePlantarumRgpd";

export default function RgpdPage() {
  const { registerHash, checkHash, deleteHash, loading } = useRgpd();
  const [inputData, setInputData] = useState("");
  const [hashToCheck, setHashToCheck] = useState("");
  const [message, setMessage] = useState("");

  // Simulamos cálculo de hash en frontend (en producción lo hará el middleware con salt)
  const fakeHash = (data: string) => {
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      });
  };

  const handleStore = async () => {
    try {
      const hash = await fakeHash(inputData);
      await registerHash(hash); // ✅ usamos la función real del contrato
      setMessage(`✅ Hash almacenado Off-chain: ${hash}`);
    } catch (err: any) {
      setMessage("❌ Error al guardar: " + err.message);
    }
  };

  const handleCheck = async () => {
    try {
      const exists = await checkHash(hashToCheck);
      setMessage(exists ? "✅ Hash existe en Almacenamiento Off-chain" : "⚠️ Hash no registrado");
    } catch (err: any) {
      setMessage("❌ Error al verificar: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHash(hashToCheck);
      setMessage("✅ Hash eliminado (derecho al olvido aplicado)");
    } catch (err: any) {
      setMessage("❌ Error al eliminar: " + err.message);
    }
  };

  return (
    <main className="p-10 min-h-screen">
      <h2 className="text-3xl font-bold text-green-400 text-center mb-6">
        🔒 RGPD – Gestión de Datos Personales
      </h2>
      <p className="text-green-200 text-center mb-10">
        Pruebas de almacenamiento y borrado de datos bajo RGPD.
      </p>

      <div className="bg-green-900 p-8 rounded-2xl max-w-2xl mx-auto shadow-lg flex flex-col gap-6">

        {/* Guardar */}
        <div>
          <h3 className="text-xl text-green-300 mb-2">1️⃣ Guardar dato → hash</h3>
          <input
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Ejemplo: Juan Pérez, DNI 12345678A"
            className="input-dark w-full"
          />
          <button
            onClick={handleStore}
            disabled={loading}
            className="btn-green w-full mt-3"
          >
            Guardar Off Chain
          </button>
        </div>

        {/* Verificar */}
        <div>
          <h3 className="text-xl text-green-300 mb-2">2️⃣ Verificar hash</h3>
          <input
            type="text"
            value={hashToCheck}
            onChange={(e) => setHashToCheck(e.target.value)}
            placeholder="Hash a verificar"
            className="input-dark w-full"
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className="btn-green w-full mt-3"
          >
            Verificar Hash
          </button>
        </div>

        {/* Borrar */}
        <div>
          <h3 className="text-xl text-green-300 mb-2">3️⃣ Eliminar hash</h3>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-red w-full"
          >
            🗑️ Eliminar Hash
          </button>
        </div>

        {/* Mensajes */}
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
