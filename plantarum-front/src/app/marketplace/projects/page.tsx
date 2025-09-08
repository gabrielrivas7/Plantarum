// src/app/marketplace/projects/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

interface ProjectAsset {
  id: number;
  creator: string;
  price: string;
  supply: number;
  maturityDate: number;
  yieldPercent: number;
  phases: number;
  listed: boolean;
}

export default function ProjectsMarketplacePage() {
  const [projects, setProjects] = useState<ProjectAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        if (!(window as any).ethereum) return;
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
          provider
        );

        const ids: bigint[] = await contract.getAllTokens();
        const results: ProjectAsset[] = [];

        for (const id of ids) {
          try {
            const meta = await contract.getProjectMeta(id);
            if (meta.listed) {
              results.push({
                id: Number(id),
                creator: meta.creator,
                price: ethers.formatEther(meta.price),
                supply: Number(meta.supply),
                maturityDate: Number(meta.maturityDate),
                yieldPercent: Number(meta.yieldPercent),
                phases: Number(meta.phases),
                listed: meta.listed,
              });
            }
          } catch {
            // si no es un ProjectMeta válido, lo ignoramos
          }
        }

        setProjects(results);
      } catch (err) {
        console.error("❌ Error cargando proyectos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <main className="p-10">
      <h2 className="text-3xl font-bold text-green-400 mb-4 text-center">
      💼 Proyectos Forestales
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
        <p className="text-gray-400 text-center">⏳ Cargando proyectos...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400 text-center">
          ⚠️ No hay proyectos forestales disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-green-500/20 hover:border-green-400 transition"
            >
              <h3 className="text-green-300 font-bold mb-3">
                Proyecto #{p.id}
              </h3>
              <p className="text-gray-400 mb-2">
                👤 {p.creator.slice(0, 6)}...{p.creator.slice(-4)}
              </p>
              <p className="text-gray-200 mb-2">💰 {p.price} ETH</p>
              <p className="text-gray-200 mb-2">📦 Supply: {p.supply}</p>
              <p className="text-gray-200 mb-2">
                📆 Vencimiento:{" "}
                {new Date(p.maturityDate * 1000).toLocaleDateString()}
              </p>
              <p className="text-gray-200 mb-2">📈 Yield: {p.yieldPercent}%</p>
              <p className="text-gray-200 mb-4">🛠️ Fases: {p.phases}</p>

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
