// src/app/treasury/deposit/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import TreasuryABI from "@/abi/PlantarumTreasury.json";
import TokenABI from "@/abi/PlantarumToken.json";
import addresses from "@/utils/addresses_eth";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;
const TOKEN_ADDRESS = addresses.PlantarumToken;

export default function TreasuryDepositPage() {
  const [amountEth, setAmountEth] = useState("");
  const [amountPlntx, setAmountPlntx] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");

  async function depositETH() {
    try {
      if (!window.ethereum) throw new Error("⚠️ Wallet no encontrada");
      if (!amountEth || isNaN(Number(amountEth))) {
        setMessage("⚠️ Ingresa un monto válido en ETH.");
        return;
      }

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);

      const tx = await treasury.depositETH({ value: ethers.parseEther(amountEth) });
      await tx.wait();

      setTxHash(tx.hash);
      setMessage("✅ Depósito en ETH confirmado.");
    } catch (err) {
      console.error("Error depositando ETH:", err);
      setMessage("❌ Error al depositar ETH.");
    } finally {
      setLoading(false);
    }
  }

  async function depositPLNTX() {
    try {
      if (!window.ethereum) throw new Error("⚠️ Wallet no encontrada");
      if (!amountPlntx || isNaN(Number(amountPlntx))) {
        setMessage("⚠️ Ingresa un monto válido en PLNTX.");
        return;
      }

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const token = new ethers.Contract(TOKEN_ADDRESS, TokenABI, signer);
      const value = ethers.parseUnits(amountPlntx, 18);

      const approveTx = await token.approve(TREASURY_ADDRESS, value);
      await approveTx.wait();

      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);
      const tx = await treasury.depositToken(TOKEN_ADDRESS, value);
      await tx.wait();

      setTxHash(tx.hash);
      setMessage("✅ Depósito en PLNTX confirmado.");
    } catch (err: any) {
      console.error("Error depositando PLNTX:", err);

      // ⚡ Manejo específico si el contrato devuelve "Token not supported"
      if (err?.reason?.includes("Token not supported")) {
        setMessage("⚠️ El token PLNTX aún no está habilitado en la Tesorería. Debe agregarse primero en la plataforma.");
      } else {
        setMessage("❌ Error al depositar PLNTX.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">💸 Depositar – Tesorería</h2>
      <p className="text-center max-w-2xl mb-12">
        Envía fondos a la Tesorería de Plantarum. Puedes depositar ETH o PLNTX
        de forma segura y quedarán registrados en el contrato.
      </p>

      {/* Box ETH */}
      <div className="w-full max-w-2xl bg-black/50 border-2 border-green-600 rounded-xl p-8 shadow-lg flex flex-col gap-6 mb-16">
        <h3 className="text-xl font-bold text-green-400">⛽ Depositar ETH</h3>
        <p className="text-gray-300">Ingresa la cantidad de ETH a enviar a la Tesorería.</p>
        <input
          type="text"
          placeholder="Cantidad en ETH"
          value={amountEth}
          onChange={(e) => setAmountEth(e.target.value)}
          className="w-full p-3 rounded-lg bg-black border-2 border-green-500 text-center text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={depositETH}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-green-700 hover:bg-green-600 text-white font-semibold"
        >
          {loading ? "Procesando..." : "Depositar ETH"}
        </button>
      </div>

      {/* Box PLNTX */}
      <div className="w-full max-w-2xl bg-black/50 border-2 border-green-600 rounded-xl p-8 shadow-lg flex flex-col gap-6">
        <h3 className="text-xl font-bold text-green-400">🌲 Depositar PLNTX</h3>
        <p className="text-gray-300">Autoriza y deposita tokens PLNTX en la Tesorería.</p>
        <input
          type="text"
          placeholder="Cantidad en PLNTX"
          value={amountPlntx}
          onChange={(e) => setAmountPlntx(e.target.value)}
          className="w-full p-3 rounded-lg bg-black border-2 border-green-500 text-center text-white focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={depositPLNTX}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-green-700 hover:bg-green-600 text-white font-semibold"
        >
          {loading ? "Procesando..." : "Depositar PLNTX"}
        </button>
      </div>

      {/* Botón volver */}
      <div className="mt-12">
        <Link
          href="/treasury"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver al Tesoro
        </Link>
      </div>

      {/* Mensajes */}
      {message && <p className="mt-6 text-sm text-center text-green-400">{message}</p>}
      {txHash && (
        <p className="mt-2 text-sm text-green-400">
          🔗{" "}
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
