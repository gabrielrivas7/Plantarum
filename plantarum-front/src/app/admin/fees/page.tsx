//src/app/admin/fee/page.tsx

"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

export default function AdminFeesPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feeVenta, setFeeVenta] = useState("");
  const [feeSubasta, setFeeSubasta] = useState("");
  const [monedas, setMonedas] = useState<string[]>([]);
  const [newMoneda, setNewMoneda] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Cargar cuenta y rol
  useEffect(() => {
    const init = async () => {
      if (!(window as any).ethereum) return;
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contract = new ethers.Contract(
        addresses.Plantarum721,
        Plantarum721ABI,
        signer
      );

      // 🔹 Verificar si es admin
      try {
        const SUPER_ADMIN_ROLE = ethers.id("SUPER_ADMIN_ROLE");
        const admin = await contract.hasRole(SUPER_ADMIN_ROLE, address);
        setIsAdmin(admin);

      } catch (err) {
        console.error("Error verificando rol:", err);
      }
    };

    init();
  }, []);

  // ✅ Guardar fees
  const updateFees = async () => {
    if (!account) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum721,
        Plantarum721ABI,
        signer
      );

      const tx1 = await contract.setFeeVenta(ethers.parseUnits(feeVenta, 2)); // %
      await tx1.wait();
      const tx2 = await contract.setFeeSubasta(ethers.parseUnits(feeSubasta, 2));
      await tx2.wait();

      alert("✅ Fees actualizados correctamente");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error actualizando fees: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Agregar moneda permitida
  const addMoneda = async () => {
    if (!newMoneda) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum721,
        Plantarum721ABI,
        signer
      );

      const tx = await contract.setAllowedToken(newMoneda, true);
      await tx.wait();

      setMonedas([...monedas, newMoneda]);
      setNewMoneda("");
      alert("✅ Moneda agregada correctamente");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error agregando moneda: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return <p className="text-center mt-10">🔑 Conecta tu wallet...</p>;
  }

  if (!isAdmin) {
    return (
      <p className="text-center mt-10 text-red-400">
        🚫 No tienes permisos para acceder a esta sección.
      </p>
    );
  }

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        ⚙️ Configuración de Fees y Monedas
      </h2>

      <div
        style={{
          backgroundColor: "#111827",
          padding: "32px",
          borderRadius: "16px",
          maxWidth: "700px",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        {/* Fees */}
        <div className="flex flex-col gap-4 mb-6">
          <label className="text-green-200">
            Fee de Venta (%)  
            <input
              type="number"
              value={feeVenta}
              onChange={(e) => setFeeVenta(e.target.value)}
              className="input-dark"
              placeholder="Ej: 2"
            />
          </label>

          <label className="text-green-200">
            Fee de Subasta (%)  
            <input
              type="number"
              value={feeSubasta}
              onChange={(e) => setFeeSubasta(e.target.value)}
              className="input-dark"
              placeholder="Ej: 3"
            />
          </label>

          <button
            onClick={updateFees}
            className="btn-green"
            disabled={loading}
          >
            {loading ? "⏳ Guardando..." : "💾 Guardar Fees"}
          </button>
        </div>

        {/* Monedas */}
        <div className="flex flex-col gap-4">
          <label className="text-green-200">
            Nueva Moneda (address ERC20)  
            <input
              type="text"
              value={newMoneda}
              onChange={(e) => setNewMoneda(e.target.value)}
              className="input-dark"
              placeholder="0x..."
            />
          </label>

          <button
            onClick={addMoneda}
            className="btn-green"
            disabled={loading}
          >
            {loading ? "⏳ Agregando..." : "➕ Agregar Moneda"}
          </button>

          <div className="mt-4">
            <h3 className="text-green-400 font-bold mb-2">Monedas Permitidas:</h3>
            <ul className="list-disc list-inside text-gray-200">
              {monedas.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
