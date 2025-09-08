//src/app/treasury/withdraw/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import TreasuryABI from "../../../../abi/PlantarumTreasury.json" assert { type: "json" };
import addresses from "../../../../utils/addresses_eth";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;
const TOKEN_ADDRESS = addresses.PlantarumToken;

export default function TreasuryWithdrawPage() {
  const [ethAmount, setEthAmount] = useState("");
  const [plntxAmount, setPlntxAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  async function withdrawETH() {
    try {
      if (!window.ethereum) throw new Error("Wallet no encontrada");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);

      const tx = await treasury.withdrawETH(
        recipient,
        ethers.parseEther(ethAmount)
      );
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      console.error("Error retirando ETH:", err);
    } finally {
      setLoading(false);
    }
  }

  async function withdrawPLNTX() {
    try {
      if (!window.ethereum) throw new Error("Wallet no encontrada");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);

      const value = ethers.parseUnits(plntxAmount, 18);
      const tx = await treasury.withdrawToken(TOKEN_ADDRESS, recipient, value);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      console.error("Error retirando PLNTX:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🏦 Retirar – Tesorería</h2>
      <p className="text-center max-w-2xl mb-12">
        Solo los administradores de la Tesorería pueden retirar fondos. 
        Los retiros quedan registrados en la blockchain para auditoría.
      </p>

      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <div className="card">
            <div className="card-title">⛽ Retirar ETH</div>
            <p className="card-text">Envía ETH desde la Tesorería a un destinatario.</p>
            <input
              type="text"
              placeholder="Cantidad en ETH"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="w-full p-2 mt-2 rounded bg-black/30 text-center"
            />
            <input
              type="text"
              placeholder="Dirección destinatario"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 mt-2 rounded bg-black/30 text-center mt-2"
            />
            <button
              onClick={withdrawETH}
              disabled={loading}
              className="mt-3 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white"
            >
              {loading ? "Procesando..." : "Retirar ETH"}
            </button>
          </div>

          <div className="card">
            <div className="card-title">🌲 Retirar PLNTX</div>
            <p className="card-text">Envía PLNTX desde la Tesorería a un destinatario.</p>
            <input
              type="text"
              placeholder="Cantidad en PLNTX"
              value={plntxAmount}
              onChange={(e) => setPlntxAmount(e.target.value)}
              className="w-full p-2 mt-2 rounded bg-black/30 text-center"
            />
            <input
              type="text"
              placeholder="Dirección destinatario"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 mt-2 rounded bg-black/30 text-center mt-2"
            />
            <button
              onClick={withdrawPLNTX}
              disabled={loading}
              className="mt-3 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white"
            >
              {loading ? "Procesando..." : "Retirar PLNTX"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Botón volver al Tesoro */}
      <div className="mt-10">
        <Link
          href="/treasury"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver al Tesoro
        </Link>
      </div>

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
    </main>
  );
}
