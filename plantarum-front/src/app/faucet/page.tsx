// src/app/faucet/page.tsx
"use client";

import { useState } from "react";
import { usePlantarumToken } from "../../../hooks/usePlantarumToken";
import { useWallet } from "../../context/WalletContext";

export default function FaucetPage() {
  const { faucet } = usePlantarumToken();
  const { account, connectWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleFaucet = async () => {
    try {
      setLoading(true);
      const txHash = await faucet();
      alert(`✅ Faucet solicitado. Tx hash: ${txHash}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error solicitando faucet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">💧 Faucet PLNTX</h2>

      <div className="flex justify-center">
        {account ? (
          <button onClick={handleFaucet} disabled={loading} className="btn-green">
            {loading ? "⏳ Solicitando..." : "💧 Solicitar 50 PLNTX"}
          </button>
        ) : (
          <button onClick={connectWallet} className="btn-green">
            🔗 Conectar Wallet
          </button>
        )}
      </div>
    </main>
  );
}


