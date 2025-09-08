//src/app/treasury/balances/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { provider } from "../../../../utils/web3Config";
import TreasuryABI from "../../../../abi/PlantarumTreasury.json" assert { type: "json" };
import TokenABI from "../../../../abi/PlantarumToken.json" assert { type: "json" };
import addresses from "../../../../utils/addresses_eth";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;
const TOKEN_ADDRESS = addresses.PlantarumToken;

export default function TreasuryBalancesPage() {
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [plntxBalance, setPlntxBalance] = useState<string>("0");
  const [tokens, setTokens] = useState<{ address: string; balance: string }[]>([]);

  async function loadBalances() {
    try {
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, provider);

      // ETH
      const eth = await treasury.getETHBalance();
      setEthBalance(ethers.formatEther(eth));

      // PLNTX
      const plntx = new ethers.Contract(TOKEN_ADDRESS, TokenABI, provider);
      const plntxBal = await plntx.balanceOf(TREASURY_ADDRESS);
      setPlntxBalance(ethers.formatUnits(plntxBal, 18));

      // Tokens soportados
      const supported = await treasury.getSupportedTokens();
      const balances: { address: string; balance: string }[] = [];
      for (const t of supported) {
        if (t.toLowerCase() === TOKEN_ADDRESS.toLowerCase()) continue;
        const erc20 = new ethers.Contract(t, TokenABI, provider);
        const bal = await erc20.balanceOf(TREASURY_ADDRESS);
        balances.push({ address: t, balance: ethers.formatUnits(bal, 18) });
      }
      setTokens(balances);
    } catch (err) {
      console.error("Error loading balances:", err);
    }
  }

  useEffect(() => {
    loadBalances();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">📊 Balances – Tesorería</h2>
      <p className="text-center max-w-2xl mb-12">
        Consulta los saldos actuales de ETH, PLNTX y los tokens soportados en la Tesorería.
        Estos balances se actualizan en tiempo real según las operaciones en la DApp.
      </p>

      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <div className="card">
            <div className="card-title">⛽ ETH</div>
            <p className="card-text">
              Balance actual en Tesorería:{" "}
              <span className="font-extrabold text-green-300">
                {Number(ethBalance).toLocaleString("en-US")}
              </span>
            </p>
          </div>
          <div className="card">
            <div className="card-title">🌲 PLNTX</div>
            <p className="card-text">
              Tokens de Tesorería:{" "}
              <span className="font-extrabold text-green-300">
                {Number(plntxBalance).toLocaleString("en-US")}
              </span>
            </p>
          </div>
        </div>

        {/* Segunda fila: tokens soportados */}
        {tokens.length > 0 && (
          <div className="card-row">
            {tokens.map((t, i) => (
              <div key={i} className="card">
                <div className="card-title">🪙 ERC20 Token</div>
                <p className="card-text">
                  <span className="text-xs text-green-400/70">{t.address}</span>
                  <br />
                  Balance:{" "}
                  <span className="font-extrabold text-green-300">
                    {Number(t.balance).toLocaleString("en-US")}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
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
    </main>
  );
}

