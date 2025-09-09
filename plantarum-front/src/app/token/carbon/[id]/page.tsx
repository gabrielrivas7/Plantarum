//src/app/token/carbon/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function CarbonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<any>(null);
  const [offchain, setOffchain] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("1");
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
          provider
        );

        // 📌 Metadata on-chain
        const carbonMeta = await contract.getCarbonMeta(id);

        // 📌 URI → metadata off-chain
        const tokenURI = await contract.uri(id);
        const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const res = await fetch(url);
        const data = await res.json();

        // 📌 balance disponible
        const balance = await contract.balanceOf(carbonMeta.creator, id);

        setMeta({
          ...carbonMeta,
          supply: Number(carbonMeta.supply),
          price: ethers.formatEther(carbonMeta.price),
          available: Number(balance),
        });
        setOffchain(data);
      } catch (err) {
        console.error("❌ Error cargando metadata:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleInvest = async () => {
    try {
      if (!(window as any).ethereum) throw new Error("Instala MetaMask");
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        signer
      );

      const total = ethers.parseEther((parseFloat(meta.price) * parseInt(amount)).toString());

      const tx = await contract.buyCarbon(id, parseInt(amount), { value: total });
      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      alert("✅ Inversión realizada");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error en la inversión: " + err.message);
    }
  };

  if (loading) return <p className="text-center text-yellow-400">⏳ Cargando token...</p>;
  if (!meta) return <p className="text-center text-red-400">⚠️ Token no encontrado</p>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-green-400 mb-6">
        🌍 Detalle Crédito de Carbono #{id}
      </h2>

      <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-green-700">
        <h3 className="text-xl font-bold text-green-300 mb-4">{offchain?.titulo || "Proyecto"}</h3>
        <p className="text-gray-300 mb-2">{offchain?.descripcion}</p>
        <p className="text-gray-400">📍 Coordenadas: {meta.coords}</p>
        <p className="text-gray-400">📦 Supply total: {meta.supply}</p>
        <p className="text-gray-400">✅ Disponibles: {meta.available}</p>
        <p className="text-gray-400">
          💰 Precio unitario: {meta.price} ETH
        </p>
        <p className="text-gray-400">🏷️ Estándar: {meta.standard}</p>
        <p className="text-gray-400">🌱 Tipo de proyecto: {meta.projectType}</p>
        <p className="text-gray-400">📅 Vintage: {meta.vintage?.toString()}</p>
        <p className="text-gray-400">✔️ Certificadora: {meta.verificationBody}</p>
        <p className="text-gray-400">
          ⏳ Expira: {new Date(Number(meta.expiryDate) * 1000).toLocaleDateString()}
        </p>

        {offchain?.imagenes && (
          <div className="grid grid-cols-2 gap-4 my-4">
            {offchain.imagenes.map((img: string, i: number) => (
              <img key={i} src={img} alt="preview" className="rounded-lg" />
            ))}
          </div>
        )}

        {/* Comprar / Invertir */}
        <div className="mt-6">
          <input
            type="number"
            min={1}
            max={meta.available}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-dark mb-3"
            placeholder="Cantidad a invertir"
          />
          <button
            onClick={handleInvest}
            className="btn-green w-full"
            disabled={parseInt(amount) > meta.available}
          >
            💸 Invertir
          </button>
        </div>

        {txHash && (
          <p className="mt-4 text-green-400">
            ✅ TX enviada:{" "}
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
