//src/app/treasury/supported/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import TreasuryABI from "../../../../abi/PlantarumTreasury.json" assert { type: "json" };
import addresses from "../../../../utils/addresses_eth";
import { provider } from "../../../../utils/web3Config";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;

export default function TreasurySupportedPage() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [newToken, setNewToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  async function loadTokens() {
    try {
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, provider);
      const supported = await treasury.getSupportedTokens();
      setTokens(supported);
    } catch (err) {
      console.error("Error cargando tokens soportados:", err);
    }
  }

  async function addToken() {
    try {
      if (!window.ethereum) throw new Error("Wallet no encontrada");
      setLoading(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const treasury = new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);

      const tx = await treasury.addSupportedToken(newToken);
      await tx.wait();
      setTxHash(tx.hash);

      // recargar lista
      loadTokens();
      setNewToken("");
    } catch (err) {
      console.error("Error agregando token:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🪙 Tokens Soportados – Tesorería</h2>
      <p className="text-center max-w-2xl mb-12">
        Consulta y administra la lista de tokens ERC20 que la Tesorería acepta.
        Solo los administradores pueden añadir nuevos tokens.
      </p>

      <div className="flex flex-col items-center">
        {/* Lista de tokens soportados */}
        <div className="card-row">
          {tokens.length > 0 ? (
            tokens.map((t, i) => (
              <div key={i} className="card">
                <div className="card-title">🪙 Token #{i + 1}</div>
                <p className="card-text text-xs break-all">{t}</p>
              </div>
            ))
          ) : (
            <p className="text-green-400">⚠️ No hay tokens soportados aún.</p>
          )}
        </div>

        {/* Card para añadir nuevo token */}
        <div className="card-row mt-6">
          <div className="card">
            <div className="card-title">➕ Añadir Token</div>
            <p className="card-text">Introduce la dirección del contrato ERC20.</p>
            <input
              type="text"
              placeholder="Dirección ERC20"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              className="w-full p-2 mt-2 rounded bg-black/30 text-center"
            />
            <button
              onClick={addToken}
              disabled={loading}
              className="mt-3 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white"
            >
              {loading ? "Procesando..." : "Agregar Token"}
            </button>
          </div>
        </div>
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

      {txHash && (
        <p className="mt-6 text-sm text-green-400">
          ✅ Transacción confirmada:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Ver en Etherscan
          </a>
        </p>
      )}
    </main>
  );
}
