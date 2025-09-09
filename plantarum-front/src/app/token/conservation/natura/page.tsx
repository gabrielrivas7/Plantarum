"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

export default function NaturaPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(addresses.Plantarum721, Plantarum721ABI, provider);

        const ids: number[] = await contract.getAllTokens();
        const arr: any[] = [];

        for (const id of ids) {
          try {
            const uri = await contract.tokenURI(id);
            const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
            const res = await fetch(url);
            const data = await res.json();
            arr.push({ id, ...data });
          } catch {
            console.warn(`⚠️ Token ${id} no existe o fue quemado → ignorado`);
          }
        }

        setTokens(arr.reverse());
      } catch (err) {
        console.error("❌ Error cargando Natura:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="p-10 text-center text-yellow-400">
        ⏳ Cargando activos de Conservación...
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-extrabold text-green-500 text-center mb-10">🌱 Natura – Activos de Conservación</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {tokens.map((t) => {
          const imageFile = t.files?.find((f: any) => f.type && f.type.startsWith("image/"));

          return (
            <div
              key={t.id}
              className="relative bg-green-950 rounded-2xl shadow-lg shadow-green-800/50 border border-green-700 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
            >
              {imageFile ? (
                <div className="relative">
                  <img
                    src={`https://ipfs.io/ipfs/${imageFile.IpfsHash}`}
                    alt={t.titulo}
                    className="w-full h-48 object-cover border-b border-green-800"
                  />
                  <Link
                    href={`/token/${t.id}`}
                    className="absolute inset-0 bg-green-900/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
                  >
                    <span className="text-green-300 text-2xl font-bold">🌱 Ver Activo</span>
                  </Link>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center border-b border-green-800 text-green-400">
                  📄 Sin imagen
                </div>
              )}

              <div className="p-5 text-center">
                <h2 className="text-lg font-bold text-green-300 mb-1">{t.titulo}</h2>
                <p className="text-green-400 text-sm">{t.comunidadAutonoma}</p>
                <p className="text-green-500 text-xs font-mono mb-4">📍 {t.coords}</p>
                <Link
                  href={`/token/${t.id}`}
                  className="inline-block bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Ver Activo
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
