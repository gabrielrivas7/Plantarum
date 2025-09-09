// src/app/treasury/balance/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import TreasuryABI from "../../../../abi/PlantarumTreasury.json";
import addresses from "../../../../utils/addresses_eth";
import { provider } from "../../../../utils/web3Config";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;

export default function TreasuryBalancePage() {
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [tokenBalances, setTokenBalances] = useState<{ token: string; balance: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadBalances() {
    try {
      setLoading(true);
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, provider);

      // ETH
      const ethBal = await treasury.getETHBalance();
      setEthBalance(ethers.formatEther(ethBal));

      // Tokens soportados
      const tokens: string[] = await treasury.getSupportedTokens();
      const balances: { token: string; balance: string }[] = [];

      for (const token of tokens) {
        const bal = await treasury.getTokenBalance(token);
        balances.push({
          token,
          balance: ethers.formatUnits(bal, 18),
        });
      }

      setTokenBalances(balances);
    } catch (err) {
      console.error("❌ Error cargando balances:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBalances();
  }, []);

  return (
    <main className="p-10 min-h-screen bg-green-950">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">💰 Balances – Tesorería</h2>

      {loading && <p className="text-green-300">⏳ Cargando balances...</p>}

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-green-800/60 p-6 rounded-xl shadow border border-green-500/30">
          <h3 className="text-green-300 font-semibold mb-2">ETH</h3>
          <p className="text-green-100 text-lg">{ethBalance} ETH</p>
        </div>

        {tokenBalances.map((t, idx) => (
          <div
            key={idx}
            className="bg-green-800/60 p-6 rounded-xl shadow border border-green-500/30"
          >
            <h3 className="text-green-300 font-semibold mb-2">Token</h3>
            <p className="text-green-200 break-words">{t.token}</p>
            <p className="text-green-100 text-lg mt-2">{t.balance}</p>
          </div>
        ))}
      </div>

      {/* Botón volver */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/treasury"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver a Tesoro
        </Link>
      </div>
    </main>
  );
}
