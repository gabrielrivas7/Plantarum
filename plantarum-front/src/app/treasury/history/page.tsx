// src/app/treasury/history/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers, EventLog } from "ethers";
import TreasuryABI from "../../../../abi/PlantarumTreasury.json";
import addresses from "../../../../utils/addresses_eth";
import { provider } from "../../../../utils/web3Config";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;

interface EventItem {
  type: string;
  data: string;
  txHash: string;
}

export default function TreasuryHistoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    try {
      setLoading(true);
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, provider);
      const logs: EventItem[] = [];

      // 📥 Deposit
      const dep = await treasury.queryFilter(treasury.filters.Deposit());
      dep.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          const token = ev.args.token;
          const isETH = token === ethers.ZeroAddress;
          logs.push({
            type: isETH ? "💰 Depósito ETH" : "💰 Depósito Token",
            data: isETH
              ? `De: ${ev.args.from} | Cantidad: ${ethers.formatEther(ev.args.amount)} ETH`
              : `De: ${ev.args.from} | Token: ${token} | Cantidad: ${ethers.formatUnits(
                  ev.args.amount,
                  18
                )}`,
            txHash: e.transactionHash,
          });
        }
      });

      // 📤 Withdraw
      const wit = await treasury.queryFilter(treasury.filters.Withdraw());
      wit.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          const token = ev.args.token;
          const isETH = token === ethers.ZeroAddress;
          logs.push({
            type: isETH ? "🏦 Retiro ETH" : "🏦 Retiro Token",
            data: isETH
              ? `Para: ${ev.args.to} | Cantidad: ${ethers.formatEther(ev.args.amount)} ETH`
              : `Para: ${ev.args.to} | Token: ${token} | Cantidad: ${ethers.formatUnits(
                  ev.args.amount,
                  18
                )}`,
            txHash: e.transactionHash,
          });
        }
      });

      // 🪙 Token soportado
      const sup = await treasury.queryFilter(treasury.filters.TokenSupported());
      sup.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          logs.push({
            type: ev.args.status ? "🪙 Token Añadido" : "🪙 Token Removido",
            data: `Token: ${ev.args.token}`,
            txHash: e.transactionHash,
          });
        }
      });

      // ⚡ MultiTransfer
      const multi = await treasury.queryFilter(treasury.filters.MultiTransfer());
      multi.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          logs.push({
            type: "⚡ MultiTransfer",
            data: `Token: ${ev.args.token} | Total: ${ethers.formatUnits(
              ev.args.total,
              18
            )} | Destinatarios: ${ev.args.count}`,
            txHash: e.transactionHash,
          });
        }
      });

      // Ordenar descendente por blockNumber
      logs.sort((a, b) => (a.txHash < b.txHash ? 1 : -1));
      setEvents(logs);
    } catch (err) {
      console.error("❌ Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <main className="p-10 min-h-screen bg-green-950">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        📜 Historial – Tesorería
      </h2>
      <p className="text-center max-w-2xl mb-12">
        Movimientos registrados en la Tesorería: depósitos, retiros, tokens y transferencias múltiples.
      </p>

      {loading && <p className="text-green-400">⏳ Cargando eventos...</p>}

      <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
        {events.length > 0 ? (
          events.map((ev, i) => (
            <div key={i} className="card w-full mb-4">
              <div className="card-title">{ev.type}</div>
              <p className="card-text">{ev.data}</p>
              <p className="text-xs text-green-400 mt-2">
                🔗{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${ev.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Ver en Etherscan
                </a>
              </p>
            </div>
          ))
        ) : (
          <p className="text-green-400">⚠️ No se encontraron eventos recientes.</p>
        )}
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
