// src/app/marketplace/carbon/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

interface CarbonAsset {
  id: number;
  creator: string;
  price: string;
  supply: number;
  standard: string;
  projectType: string;
  vintage: number;
  verificationBody: string;
  expiryDate: number;
  listed: boolean;
}

export default function CarbonMarketplacePage() {
  const [credits, setCredits] = useState<CarbonAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCarbonCredits = async () => {
      try {
        if (!(window as any).ethereum) return;
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
          provider
        );

        const ids: bigint[] = await contract.getAllTokens();
        const results: CarbonAsset[] = [];

        for (const id of ids) {
          try {
            const meta = await contract.getCarbonMeta(id);
            if (meta.listed) {
              results.push({
                id: Number(id),
                creator: meta.creator,
                price: ethers.formatEther(meta.price),
                supply: Number(meta.supply),
                standard: meta.standard,
                projectType: meta.projectType,
                vintage: Number(meta.vintage),
                verificationBody: meta.verificationBody,
                expiryDate: Number(meta.expiryDate),
                listed: meta.listed,
              });
            }
          } catch {
            // si no es CarbonMeta válido, lo ignoramos
          }
        }

        setCredits(results);
      } catch (err) {
        console.error("❌ Error cargando créditos de carbono:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCarbonCredits(); 
  }, []);

  return (
    <main className="p-10">
      <h2 className="text-3xl font-bold text-green-400 mb-4 text-center">
        🌍 Créditos de Carbono
      </h2>

        <div className="flex justify-center mb-10">
            <Link
                href="/marketplace"
                className="text-green-300 hover:text-green-100 flex items-center gap-2"
            >
                ← Volver al Marketplace
            </Link>
       </div>

      {loading ? (
        <p className="text-gray-400 text-center">⏳ Cargando créditos...</p>
      ) : credits.length === 0 ? (
        <p className="text-gray-400 text-center">
          ⚠️ No hay créditos de carbono disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {credits.map((c) => (
            <div
              key={c.id}
              className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-green-500/20 hover:border-green-400 transition"
            >
              <h3 className="text-green-300 font-bold mb-3">
                Crédito #{c.id}
              </h3>
              <p className="text-gray-400 mb-2">
                👤 {c.creator.slice(0, 6)}...{c.creator.slice(-4)}
              </p>
              <p className="text-gray-200 mb-2">💰 {c.price} ETH</p>
              <p className="text-gray-200 mb-2">📦 Supply: {c.supply}</p>
              <p className="text-gray-200 mb-2">📜 Estándar: {c.standard}</p>
              <p className="text-gray-200 mb-2">🌱 Tipo: {c.projectType}</p>
              <p className="text-gray-200 mb-2">📆 Vintage: {c.vintage}</p>
              <p className="text-gray-200 mb-2">
                ✅ Certificado por: {c.verificationBody}
              </p>
              <p className="text-gray-200 mb-4">
                ⏳ Expira:{" "}
                {new Date(c.expiryDate * 1000).toLocaleDateString()}
              </p>

              <button className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl">
                Invertir
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
