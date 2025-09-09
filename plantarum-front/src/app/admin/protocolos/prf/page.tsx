"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import PlantarumPRFABI from "@/abi/PlantarumPrf.json";

export default function PRFPage() {
  const [auditors, setAuditors] = useState<string[]>([]);
  const [auditorAddress, setAuditorAddress] = useState("");
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Conectar contrato
  const getContract = async () => {
    if (!(window as any).ethereum) throw new Error("Instala MetaMask");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(addresses.PlantarumPrf, PlantarumPRFABI, signer);
  };

  // 🔹 Cargar auditores
  const loadAuditors = async () => {
    try {
      const contract = await getContract();
      const list = await contract.getAuditors();
      setAuditors(list);
    } catch (err) {
      console.error("❌ Error cargando auditores:", err);
    }
  };

  // 🔹 Cargar auditorías
  const loadAudits = async () => {
    try {
      const contract = await getContract();
      const list = await contract.getAllAudits();
      setAudits(list);
    } catch (err) {
      console.error("❌ Error cargando auditorías:", err);
    }
  };

  // 🔹 Registrar auditor
  const registerAuditor = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.registerAuditor(auditorAddress);
      await tx.wait();
      setMessage("✅ Auditor registrado correctamente");
      setAuditorAddress("");
      loadAuditors();
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error registrando auditor: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Marcar fase completada (ejemplo)
  const completePhase = async (auditId: number, phase: number, ipfsHash: string) => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.completePhase(auditId, phase, ipfsHash);
      await tx.wait();
      setMessage("✅ Fase completada");
      loadAudits();
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error en fase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditors();
    loadAudits();
  }, []);

  return (
    <main className="p-10 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950">
      <h1 className="text-3xl font-extrabold text-green-400 text-center mb-10">
        🌳 Protocolo de Reserva Forestal (PRF)
      </h1>

      {message && (
        <p className="text-center mb-6" style={{ color: message.startsWith("✅") ? "#4ade80" : "#f87171" }}>
          {message}
        </p>
      )}

      {/* Registrar Auditor */}
      <div className="bg-green-800/40 p-6 rounded-2xl shadow-lg border border-green-500/20 mb-10 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-green-300 mb-4">➕ Registrar Auditor</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Dirección del auditor"
            value={auditorAddress}
            onChange={(e) => setAuditorAddress(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-green-900 text-white"
          />
          <button
            onClick={registerAuditor}
            disabled={loading || !auditorAddress}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white"
          >
            {loading ? "Procesando..." : "Registrar"}
          </button>
        </div>
      </div>

      {/* Lista de Auditores */}
      <div className="bg-green-800/40 p-6 rounded-2xl shadow-lg border border-green-500/20 mb-10 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-green-300 mb-4">👥 Lista de Auditores</h2>
        {auditors.length === 0 ? (
          <p className="text-green-200">⚠️ No hay auditores registrados.</p>
        ) : (
          <ul className="space-y-2">
            {auditors.map((a, i) => (
              <li key={i} className="bg-green-900/50 px-4 py-2 rounded-lg text-green-100 font-mono">
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Auditorías */}
      <div className="bg-green-800/40 p-6 rounded-2xl shadow-lg border border-green-500/20 mb-10 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-green-300 mb-4">📜 Auditorías</h2>
        {audits.length === 0 ? (
          <p className="text-green-200">⚠️ No hay auditorías registradas.</p>
        ) : (
          <div className="space-y-4">
            {audits.map((a: any, i) => (
              <div
                key={i}
                className="bg-green-900/50 p-4 rounded-lg border border-green-700 shadow"
              >
                <p className="text-green-200 font-semibold">ID: {Number(a.id)}</p>
                <p className="text-green-300">Activo: {a.assetHash}</p>
                <p className="text-green-300">Auditor asignado: {a.auditor}</p>
                <p className="text-green-300">Estado: {a.status}</p>

                <div className="mt-2">
                  {["Análisis", "Técnica", "Inspección", "Informe"].map((phase, idx) => (
                    <button
                      key={idx}
                      onClick={() => completePhase(Number(a.id), idx, "ipfs-hash-demo")}
                      className="mr-2 mt-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm"
                    >
                      ✅ Completar {phase}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón volver */}
      <div className="mt-12 flex justify-center">
        <Link
          href="/admin/protocolos"
          className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white shadow-md"
        >
          ← Volver a Protocolos
        </Link>
      </div>
    </main>
  );
}
