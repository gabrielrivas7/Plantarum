// src/app/token/projects/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const tokenId = Array.isArray(id) ? id[0] : id;
  const parsedId = Number(tokenId);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!(window as any).ethereum || isNaN(parsedId)) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
          provider
        );

        // 📌 Metadata on-chain
        const meta = await contract.getProjectMeta(parsedId);

        // BigInt → Number seguro
        const onchainMeta = {
          creator: meta.creator,
          hashId: meta.hashId,
          coords: meta.coords,
          timestamp: Number(meta.timestamp),
          price: Number(meta.price),
          supply: Number(meta.supply),
          maturityDate: Number(meta.maturityDate),
          yieldPercent: Number(meta.yieldPercent),
          phases: Number(meta.phases),
          listed: meta.listed,
          finalized: meta.finalized,
        };

        // 📌 URI → metadata off-chain
        const tokenURI = await contract.uri(parsedId);
        const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const res = await fetch(url);
        const data = await res.json();

        setProject({ onchain: onchainMeta, offchain: data, tokenURI });
      } catch (err) {
        console.error("❌ Error cargando detalle del Project:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [parsedId]);

  const handleInvest = async () => {
    try {
      if (!project?.onchain?.listed) {
        alert("⚠️ El proyecto no está en venta");
        return;
      }

      setInvesting(true);
      if (!(window as any).ethereum) throw new Error("Instala MetaMask");

      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        signer
      );

      // 💰 Precio por 1 unidad
      const priceWei = BigInt(project.onchain.price);
      const tx = await contract.buyProject(parsedId, 1, {
        value: priceWei,
      });

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      alert("✅ Inversión realizada con éxito");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error al invertir: " + err.message);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-yellow-400">⏳ Cargando proyecto...</p>;
  }

  if (!project) {
    return <p className="text-center text-red-400">❌ Proyecto no encontrado.</p>;
  }

  // 📊 Calcular vendidos y disponibles
  const initialSupply = project.onchain.supply;
  // En este ejemplo asumimos que `balanceOf` se consultaría si quieres dinámico.
  const vendidos = 0; // TODO: integrar balanceOf si quieres exacto
  const disponibles = initialSupply - vendidos;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
        🌲 Proyecto: {project.offchain?.titulo || "Sin título"}
      </h2>

      <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-green-500/20">
        <p><strong>📌 Hash ID:</strong> {project.onchain.hashId}</p>
        <p><strong>📍 Coordenadas:</strong> {project.onchain.coords}</p>
        <p><strong>💰 Precio unitario:</strong> {ethers.formatEther(project.onchain.price.toString())} ETH</p>
        <p><strong>📦 Supply inicial:</strong> {initialSupply}</p>
        <p><strong>✅ Disponibles:</strong> {disponibles}</p>
        <p><strong>📊 Vendidos:</strong> {vendidos}</p>
        <p><strong>📈 Rendimiento esperado:</strong> {project.onchain.yieldPercent}%</p>
        <p><strong>🗓️ Vencimiento:</strong> {new Date(project.onchain.maturityDate * 1000).toLocaleDateString()}</p>
        <p><strong>🔢 Fases:</strong> {project.onchain.phases}</p>
        <p><strong>👤 Creador:</strong> {project.onchain.creator}</p>

        <hr className="my-4 border-green-700" />

        <h3 className="text-xl font-bold text-green-300 mb-2">📝 Descripción</h3>
        <p>{project.offchain?.descripcion || "Sin descripción"}</p>

        {project.offchain?.imagenes && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {project.offchain.imagenes.map((img: string, i: number) => (
              <img key={i} src={img} alt={`Imagen ${i}`} className="rounded-lg shadow-md" />
            ))}
          </div>
        )}

        <button
          onClick={handleInvest}
          disabled={investing}
          className="mt-6 w-full px-6 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white shadow-md"
        >
          {investing ? "⏳ Invirtiendo..." : "💸 Invertir"}
        </button>

        {txHash && (
          <p className="text-green-400 mt-4 text-center">
            ✅ Transacción:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              className="underline"
            >
              {txHash}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
