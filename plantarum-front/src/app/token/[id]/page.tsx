//app/token/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

export default function TokenProfilePage() {
  const { id } = useParams();
  const [metadata, setMetadata] = useState<any>(null);
  const [tokenURI, setTokenURI] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          provider
        );

        // Obtener tokenURI on-chain
        const uri = await contract.tokenURI(id);
        setTokenURI(uri);

        // Reemplazar por gateway público para fetch
        const url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const res = await fetch(url);
        const data = await res.json();
        setMetadata(data);
      } catch (err) {
        console.error("❌ Error cargando metadata:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="p-10 text-center text-yellow-400">
        ⏳ Cargando token #{id}...
      </main>
    );
  }

  if (!metadata) {
    return (
      <main className="p-10 text-center text-red-400">
        ❌ No se encontró metadata para el token #{id}
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-extrabold text-green-500 text-center mb-8">
        🌳 Activo Tokenizado #{id}
      </h1>

      <div className="max-w-4xl mx-auto bg-green-950 rounded-2xl shadow-lg shadow-green-800/50 border border-green-700 p-8">
        {/* Campo Imágenes */}
{metadata.files && metadata.files.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
    {metadata.files
      .filter((f: any) => f.name && f.name.toLowerCase().includes("imagen"))
      .map((file: any, idx: number) => (
        <img
          key={idx}
          src={`https://ipfs.io/ipfs/${file.IpfsHash}`}
          alt={metadata.titulo || `Imagen ${idx}`}
          className="w-full h-64 object-cover rounded-lg border border-green-700 shadow-md"
        />
      ))}
  </div>
)}

        {/* Título */}
        <h2 className="text-2xl font-bold text-green-300 mb-2 text-center">
          {metadata.titulo || "Proyecto de Conservación"}
        </h2>

        {/* Subtítulo */}
        <p className="text-green-400 text-center mb-6">🌱 Proyecto de Conservación</p>

        {/* Metadatos en cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-900/40 p-4 rounded-lg border border-green-700 text-center">
            <p className="text-green-400 text-sm">Estado Legal</p>
            <p className="text-green-200 font-bold">{metadata.estadoLegal}</p>
          </div>
          <div className="bg-green-900/40 p-4 rounded-lg border border-green-700 text-center">
            <p className="text-green-400 text-sm">CCAA</p>
            <p className="text-green-200 font-bold">{metadata.comunidadAutonoma}</p>
          </div>
          <div className="bg-green-900/40 p-4 rounded-lg border border-green-700 text-center">
            <p className="text-green-400 text-sm">Coordenadas</p>
            <p className="text-green-200 font-mono">{metadata.coords}</p>
          </div>
        </div>

        {/* Enlaces al JSON en IPFS */}
        {tokenURI && (
          <div className="mt-8 text-center space-y-2">
            <p className="text-green-400 text-sm">📦 Metadata JSON en IPFS:</p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${tokenURI.replace("ipfs://", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-green-300 underline hover:text-green-200"
            >
              🌐 Pinata Gateway
            </a>
            <a
              href={`https://ipfs.io/ipfs/${tokenURI.replace("ipfs://", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-green-300 underline hover:text-green-200"
            >
              🌍 IPFS.io Gateway
            </a>
          </div>
        )}

        {/* Botón de regreso */}
        <div className="mt-10 text-center">
          <Link
            href="/token/conservation/natura"
            className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
          >
            ⬅ Volver a Natura
          </Link>
        </div>
      </div>
    </main>
  );
}
