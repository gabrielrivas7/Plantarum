// src/app/marketplace/forest/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

interface Asset {
  id: number;
  owner: string;
  price: string;
  isAuction: boolean;
  tokenURI: string;
  auctionDeadline: number;
}

export default function ForestMarketplacePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (!(window as any).ethereum) return;
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          provider
        );

        const tokenIds: bigint[] = await contract.getAllTokens();
        const listedAssets: Asset[] = [];

        for (const id of tokenIds) {
          const meta = await contract.getTokenMeta(id);
          if (meta.listed) {
            const tokenURI = await contract.tokenURI(id);
            listedAssets.push({
              id: Number(id),
              owner: meta.walletOwner,
              price: ethers.formatEther(meta.price),
              isAuction: meta.isAuction,
              tokenURI,
              auctionDeadline: Number(meta.auctionDeadline),
            });
          }
        }

        setAssets(listedAssets);
      } catch (err) {
        console.error("❌ Error cargando activos forestales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  // ⏳ contador para subastas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const newTimes: { [key: number]: string } = {};

      assets.forEach((asset) => {
        if (asset.isAuction && asset.auctionDeadline > now) {
          const diff = asset.auctionDeadline - now;
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          const s = diff % 60;
          newTimes[asset.id] = `${h}h ${m}m ${s}s`;
        } else if (asset.isAuction && asset.auctionDeadline <= now) {
          newTimes[asset.id] = "⏳ Finalizada";
        }
      });

      setTimeLeft(newTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [assets]);

  return (
    <main className="p-10">
      <h2 className="text-3xl font-bold text-green-400 mb-4 text-center">
        🌲 Activos Forestales
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
        <p className="text-gray-400 text-center">⏳ Cargando activos forestales...</p>
      ) : assets.length === 0 ? (
        <p className="text-gray-400 text-center">
          ⚠️ No hay activos forestales disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-green-500/20 hover:border-green-400 transition"
            >
              <h3 className="text-green-300 font-bold mb-3">Token #{asset.id}</h3>
              <p className="text-gray-400 mb-2">
                👤 {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
              </p>
              <p className="text-gray-200 mb-2">💰 {asset.price} ETH</p>

              {asset.isAuction ? (
                <>
                  <p className="text-yellow-400 mb-3">
                    ⏳ Subasta {timeLeft[asset.id] || "Calculando..."}
                  </p>
                  <button className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl">
                    Pujar
                  </button>
                </>
              ) : (
                <button className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl">
                  Comprar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
