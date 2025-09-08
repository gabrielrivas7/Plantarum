// src/app/admin/adminrole/page.tsx
"use client";

import { useEffect, useState } from "react";
import { usePlantarumDao } from "@/hooks/usePlantarumDao";

// 🔹 Definimos el tipo correcto para roles
type CommitteeRoleType = "CONSERVATION" | "PROJECTS" | "CARBON";

export default function AdminRolePage() {
  const {
    account,
    getAllMembers,
    grantCommitteeRole,
    revokeCommitteeRole,
    hasCommitteeRole,
  } = usePlantarumDao();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleType, setRoleType] = useState<CommitteeRoleType>("CONSERVATION");
  const [selectedWallet, setSelectedWallet] = useState("");

  // 🔹 Cargar miembros al montar
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const list = await getAllMembers();
        setMembers(list);
      } catch (err) {
        console.error("❌ Error cargando miembros:", err);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [getAllMembers]);

  const handleGrant = async (wallet: string) => {
    try {
      await grantCommitteeRole(wallet, roleType);
      alert(`✅ Rol ${roleType} asignado a ${wallet}`);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  const handleRevoke = async (wallet: string) => {
    try {
      await revokeCommitteeRole(wallet, roleType);
      alert(`❌ Rol ${roleType} revocado de ${wallet}`);
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  const handleCheck = async (wallet: string) => {
    try {
      const hasRole = await hasCommitteeRole(wallet, roleType);
      alert(
        hasRole
          ? `✅ ${wallet} TIENE el rol ${roleType}`
          : `⚠️ ${wallet} NO tiene el rol ${roleType}`
      );
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-[75vh] px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        ⚙️ Panel de Roles de Comités
      </h2>

      <div className="card-dark mb-6 flex flex-col items-center space-y-4 w-full max-w-2xl">
        {/* Selección de rol */}
        <select
          value={roleType}
          onChange={(e) => setRoleType(e.target.value as CommitteeRoleType)}
          className="input-dark"
        >
          <option value="CONSERVATION">🌱 Conservation</option>
          <option value="PROJECTS">🏗️ Projects</option>
          <option value="CARBON">🌍 Carbon</option>
        </select>

        {/* Dirección manual */}
        <input
          type="text"
          placeholder="Wallet Address manual"
          value={selectedWallet}
          onChange={(e) => setSelectedWallet(e.target.value)}
          className="input-dark"
        />

        {/* Botones principales */}
        <div className="flex gap-4">
          <button onClick={() => handleGrant(selectedWallet)} className="btn-green">
            Asignar
          </button>
          <button
            onClick={() => handleRevoke(selectedWallet)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Revocar
          </button>
          <button
            onClick={() => handleCheck(selectedWallet)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Verificar
          </button>
        </div>
      </div>

      {/* Tabla de miembros */}
      <h3 className="text-xl font-semibold mb-4 text-green-300">
        📋 Lista de Miembros DAO
      </h3>
      {loading ? (
        <p className="text-yellow-400">Cargando miembros...</p>
      ) : (
        <table className="min-w-full bg-gray-900 border border-green-700 shadow-md rounded-lg overflow-hidden text-sm text-green-100">
          <thead className="bg-green-900">
            <tr>
              <th className="px-4 py-2 border border-green-700">Wallet</th>
              <th className="px-4 py-2 border border-green-700">Alias</th>
              <th className="px-4 py-2 border border-green-700">Persona</th>
              <th className="px-4 py-2 border border-green-700">Estado</th>
              <th className="px-4 py-2 border border-green-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => (
              <tr key={idx} className="text-center border-b border-green-800">
                <td className="px-4 py-2">{m.wallet}</td>
                <td className="px-4 py-2">{m.aliasName}</td>
                <td className="px-4 py-2">{m.personaType}</td>
                <td className="px-4 py-2">{m.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleGrant(m.wallet)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Asignar
                  </button>
                  <button
                    onClick={() => handleRevoke(m.wallet)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Revocar
                  </button>
                  <button
                    onClick={() => handleCheck(m.wallet)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Verificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Volver */}
      <div className="mt-8">
        <a
          href="/admin"
          className="bg-gray-800 text-white px-6 py-2 rounded shadow-md"
        >
          ⬅️ Volver a Admin
        </a>
      </div>
    </main>
  );
}


