// src/app/treasury/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers, EventLog } from "ethers";
import TreasuryABI from "../../../../abi/PlantarumTreasury.json" assert { type: "json" };
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

  // 🔹 función para traer eventos en chunks
  async function fetchEventsInChunks(
    contract: ethers.Contract,
    eventFilter: any,
    fromBlock: number,
    toBlock: number,
    step = 2000 // tamaño del chunk (ajustable según RPC)
  ) {
    let logs: any[] = [];
    for (let i = fromBlock; i <= toBlock; i += step) {
      const end = Math.min(i + step - 1, toBlock);
      const chunk = await contract.queryFilter(eventFilter, i, end);
      logs = logs.concat(chunk);
    }
    return logs;
  }

  async function loadHistory() {
    try {
      setLoading(true);
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, provider);

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = currentBlock - 10000 > 0 ? currentBlock - 10000 : 0; // últimos 10k bloques

      const logs: EventItem[] = [];

      // 📥 Deposit
      const deposits = await fetchEventsInChunks(
        treasury,
        treasury.filters.Deposit(),
        fromBlock,
        currentBlock
      );
      deposits.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          const token = ev.args.token === ethers.ZeroAddress ? "ETH" : ev.args.token;
          logs.push({
            type: "💰 Depósito",
            data: `De: ${ev.args.from} | Token: ${token} | Cantidad: ${ethers.formatUnits(
              ev.args.amount,
              18
            )}`,
            txHash: e.transactionHash,
          });
        }
      });

      // 📤 Withdraw
      const withdraws = await fetchEventsInChunks(
        treasury,
        treasury.filters.Withdraw(),
        fromBlock,
        currentBlock
      );
      withdraws.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          const token = ev.args.token === ethers.ZeroAddress ? "ETH" : ev.args.token;
          logs.push({
            type: "🏦 Retiro",
            data: `Para: ${ev.args.to} | Token: ${token} | Cantidad: ${ethers.formatUnits(
              ev.args.amount,
              18
            )}`,
            txHash: e.transactionHash,
          });
        }
      });

      // ⚡ MultiTransfer
      const multiTransfers = await fetchEventsInChunks(
        treasury,
        treasury.filters.MultiTransfer(),
        fromBlock,
        currentBlock
      );
      multiTransfers.forEach((e) => {
        if ((e as EventLog).args) {
          const ev = e as EventLog;
          const token = ev.args.token === ethers.ZeroAddress ? "ETH" : ev.args.token;
          logs.push({
            type: "⚡ MultiTransfer",
            data: `Token: ${token} | Total: ${ethers.formatUnits(
              ev.args.total,
              18
            )} | Destinatarios: ${ev.args.count}`,
            txHash: e.transactionHash,
          });
        }
      });

      // Orden descendente (más recientes primero)
      logs.reverse();
      setEvents(logs);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">📜 Historial – Tesorería</h2>
      <p className="text-center max-w-2xl mb-12">
        Revisa los últimos movimientos registrados en la Tesorería: depósitos, retiros 
        y transferencias múltiples.
      </p>

      {loading && <p className="text-green-400">⏳ Cargando eventos...</p>}

      <div className="flex flex-col items-center w-full max-w-3xl">
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
