//src/app/treasury/multitransfer/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import usePlantarumTreasury from "@/hooks/usePlantarumTreasury";

export default function TreasuryMultiTransferPage() {
  const { multiTransferETH, multiTransferToken, loading } = usePlantarumTreasury();

  const [recipientsETH, setRecipientsETH] = useState("");
  const [recipientsToken, setRecipientsToken] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [txHash, setTxHash] = useState("");

  // ---------------- ETH ----------------
  async function handleMultiTransferETH() {
    try {
      const lines = recipientsETH
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const rec: string[] = [];
      const amts: string[] = [];

      for (const l of lines) {
        const [addr, amt] = l.split(",");
        if (!addr || !amt) throw new Error("Formato inválido. Usa: wallet, cantidad");
        rec.push(addr.trim());
        amts.push(amt.trim());
      }

      const tx = await multiTransferETH(rec, amts);
      setTxHash(tx.hash);
    } catch (err) {
      console.error("❌ Error en MultiTransfer ETH:", err);
      alert("Error ejecutando MultiTransfer ETH");
    }
  }

  // ---------------- ERC20 ----------------
  async function handleMultiTransferToken() {
    try {
      if (!tokenAddress) throw new Error("Debes indicar dirección ERC20");

      const lines = recipientsToken
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const rec: string[] = [];
      const amts: string[] = [];

      for (const l of lines) {
        const [addr, amt] = l.split(",");
        if (!addr || !amt) throw new Error("Formato inválido. Usa: wallet, cantidad");
        rec.push(addr.trim());
        amts.push(amt.trim());
      }

      const tx = await multiTransferToken(tokenAddress, rec, amts);
      setTxHash(tx.hash);
    } catch (err) {
      console.error("❌ Error en MultiTransfer Token:", err);
      alert("Error ejecutando MultiTransfer Token");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">⚡ Multi-Transfer – Tesorería</h2>
      <p className="text-center max-w-2xl mb-12">
        Distribuye <b>ETH</b> o <b>tokens ERC20</b> desde la Tesorería a múltiples direcciones en una sola transacción.
      </p>

      <div className="flex flex-col items-center">
        {/* Fila con dos cards lado a lado */}
        <div className="card-row">
          {/* Card ETH */}
          <div className="card flex flex-col justify-between" style={{ minHeight: "360px" }}>
            <div>
              <div className="card-title">⛽ Multi-Transfer ETH</div>
              <p className="card-text mb-2">
                Lista de destinatarios (una por línea, formato: wallet, cantidad en ETH).
              </p>
              <textarea
                rows={6}
                value={recipientsETH}
                onChange={(e) => setRecipientsETH(e.target.value)}
                placeholder={`0xabc123..., 0.5\n0xdef456..., 1.2`}
                className="w-full p-2 mt-2 rounded bg-black/30 text-sm text-white"
              />
            </div>
            <button
              onClick={handleMultiTransferETH}
              disabled={loading}
              className="mt-3 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white w-full"
            >
              {loading ? "Procesando..." : "Ejecutar MultiTransfer ETH"}
            </button>
          </div>

          {/* Card ERC20 */}
          <div className="card flex flex-col justify-between" style={{ minHeight: "360px" }}>
            <div>
              <div className="card-title">🌲 Multi-Transfer ERC20</div>
              <p className="card-text mb-2">Introduce dirección ERC20 y lista de destinatarios.</p>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0xTokenAddress..."
                className="w-full p-2 mt-2 rounded bg-black/30 text-center text-white"
              />
              <textarea
                rows={6}
                value={recipientsToken}
                onChange={(e) => setRecipientsToken(e.target.value)}
                placeholder={`0xabc123..., 100\n0xdef456..., 250`}
                className="w-full p-2 mt-2 rounded bg-black/30 text-sm text-white"
              />
            </div>
            <button
              onClick={handleMultiTransferToken}
              disabled={loading}
              className="mt-3 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white w-full"
            >
              {loading ? "Procesando..." : "Ejecutar MultiTransfer ERC20"}
            </button>
          </div>
        </div>
      </div>

      {/* Tx hash confirmación */}
      {txHash && (
        <p className="mt-6 text-sm text-green-400">
          ✅ Transacción confirmada:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Ver en Etherscan
          </a>
        </p>
      )}

      {/* Botón volver */}
      <div className="mt-10">
        <Link
          href="/treasury"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver al Tesoro
        </Link>
      </div>
    </main>
  );
}


