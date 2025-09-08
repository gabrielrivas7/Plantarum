//src/app/marketplace/page.tsx
 
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

interface Asset721 {
  id: number;
  owner: string;
  price: string;
  tokenURI: string;
}

interface Asset1155 {
  id: number;
  creator: string;
  price: string;
  supply: number;
  tokenURI: string;
  type: "carbon" | "project";
}

export default function MarketplacePage() {
  const [forest, setForest] = useState<Asset721[]>([]);
  const [projects, setProjects] = useState<Asset1155[]>([]);
  const [carbon, setCarbon] = useState<Asset1155[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);

        // 🌳 Forest (ERC721)
        const contract721 = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          provider
        );
        const ids721: bigint[] = await contract721.getAllTokens();
        const forestAssets: Asset721[] = [];
        for (const id of ids721) {
          const meta = await contract721.getTokenMeta(id);
          if (meta.listed) {
            forestAssets.push({
              id: Number(id),
              owner: meta.walletOwner,
              price: ethers.formatEther(meta.price),
              tokenURI: await contract721.tokenURI(id),
            });
          }
        }

        // 🌲 / 🌍 Projects & Carbon (ERC1155)
        const contract1155 = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
          provider
        );

        const allIds: bigint[] = await contract1155.getAllTokens();
        const projectsAssets: Asset1155[] = [];
        const carbonAssets: Asset1155[] = [];

        for (const id of allIds) {
          try {
            const projectMeta = await contract1155.getProjectMeta(id);
            if (projectMeta.listed) {
              projectsAssets.push({
                id: Number(id),
                creator: projectMeta.creator,
                price: ethers.formatEther(projectMeta.price),
                supply: Number(projectMeta.supply),
                tokenURI: await contract1155.uri(id),
                type: "project",
              });
              continue;
            }
          } catch {}

          try {
            const carbonMeta = await contract1155.getCarbonMeta(id);
            if (carbonMeta.listed) {
              carbonAssets.push({
                id: Number(id),
                creator: carbonMeta.creator,
                price: ethers.formatEther(carbonMeta.price),
                supply: Number(carbonMeta.supply),
                tokenURI: await contract1155.uri(id),
                type: "carbon",
              });
              continue;
            }
          } catch {}
        }

        setForest(forestAssets.slice(0, 3));
        setProjects(projectsAssets.slice(0, 3));
        setCarbon(carbonAssets.slice(0, 3));
      } catch (err) {
        console.error("❌ Error cargando marketplace:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const Section = ({
    title,
    icon,
    assets,
    href,
  }: {
    title: string;
    icon: string;
    assets: any[];
    href: string;
  }) => (
    <section className="bg-green-900 p-6 rounded-2xl shadow-lg border border-green-500/30">
      <h3 className="text-2xl font-bold text-green-300 mb-6 flex items-center gap-2">
        {icon} {title}
      </h3>

      {loading ? (
        <p className="text-green-300 text-center">⏳ Cargando...</p>
      ) : assets.length === 0 ? (
        <p className="text-green-400 text-center italic">
          ⚠️ No hay activos disponibles
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((a) => (
            <div
              key={a.id}
              className="bg-green-800 p-4 rounded-xl shadow-md border border-green-500/20 hover:border-green-400 transition"
            >
              <h4 className="text-green-200 font-bold">Token #{a.id}</h4>
              <p className="text-green-300 text-sm">
                👤 {(a.owner || a.creator).slice(0, 6)}...
                {(a.owner || a.creator).slice(-4)}
              </p>
              <p className="text-white">💰 {a.price} ETH</p>
              {a.supply && (
                <p className="text-green-400 text-xs">Supply: {a.supply}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href={href}
          className="px-6 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white"
        >
          Ver todos {icon}
        </Link>
      </div>
    </section>
  );

  return (
    <main className="p-10 space-y-10">
      <h2 className="text-3xl font-extrabold text-green-400 mb-10 text-center">
        🌱 Marketplace Plantarum
      </h2>

      <Section
        title="Activos Forestales"
        icon="🌳"
        assets={forest}
        href="/marketplace/forest"
      />
      <Section
        title="Proyectos Forestales"
        icon="🌲"
        assets={projects}
        href="/marketplace/projects"
      />
      <Section
        title="Créditos de Carbono"
        icon="🌍"
        assets={carbon}
        href="/marketplace/carbon"
      />
    </main>
  );
}
