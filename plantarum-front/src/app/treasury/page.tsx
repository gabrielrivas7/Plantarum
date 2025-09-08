//src/app/treasury/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePlantarumToken } from "../../../hooks/usePlantarumToken";
import addresses from "../../../utils/addresses_eth";
import PlantarumTokenABI from "../../../abi/PlantarumToken.json" assert { type: "json" };
import { provider } from "../../../utils/web3Config";


export default function TreasuryPage() {
  const [supply, setSupply] = useState<string>("");
  const [treasuryBalance, setTreasuryBalance] = useState<string>("");

  const { totalSupply } = usePlantarumToken();

  useEffect(() => {
    async function loadData() {
      try {
        // Total Supply
        const sup = await totalSupply();
        if (sup !== "0") setSupply(sup);

        // Balance del Treasury en PLNTX
        const tokenContract = new ethers.Contract(
          addresses.PlantarumToken,
          PlantarumTokenABI,
          provider
        );
        const bal = await tokenContract.balanceOf(addresses.PlantarumTreasury);
        setTreasuryBalance(ethers.formatUnits(bal, 18));
      } catch (err) {
        console.error("Error al cargar datos de Tesorería:", err);
      }
    }
    loadData();
  }, [totalSupply]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">💰 Tesorería – Treasury</h2>
      <p className="text-center max-w-2xl mb-6">
        Administra el tesoro de Plantarum: consulta balances, realiza depósitos, 
        autoriza retiros y gestiona los tokens soportados. 
        Toda la economía de la DApp se centraliza aquí 🌱.
      </p>

      {/* Primera fila → Data del Token */}
      <div className="card-row mb-10">
        {supply && (
          <div className="card text-center">
            <div className="card-title">🌲 Total Supply PLNTX</div>
            <p className="text-xs text-green-400/70 mb-1">Función: totalSupply()</p>
            <p className="card-text text-2xl font-extrabold text-green-300">{supply}</p>
          </div>
        )}
        {treasuryBalance && (
          <div className="card text-center">
            <div className="card-title">🏦 PLNTX en Tesorería</div>
            <p className="text-xs text-green-400/70 mb-1">Función: balanceOf(Treasury)</p>
            <p className="card-text text-2xl font-extrabold text-green-300">{treasuryBalance}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        {/* Segunda fila */}
        <div className="card-row">
          <Link href="/treasury/balances" className="card">
            <div className="card-title">📊 Balances</div>
            <p className="text-xs text-green-400/70 mb-1">Función: getAllBalances()</p>
            <p className="card-text">
              Consulta los balances actuales de ETH y tokens soportados en la tesorería.
            </p>
          </Link>
          <Link href="/treasury/deposit" className="card">
            <div className="card-title">💸 Depositar</div>
            <p className="text-xs text-green-400/70 mb-1">
              Función: depositETH() / depositToken()
            </p>
            <p className="card-text">
              Envía ETH o tokens ERC20 a la tesorería de forma segura.
            </p>
          </Link>
          <Link href="/treasury/withdraw" className="card">
            <div className="card-title">🏦 Retirar</div>
            <p className="text-xs text-green-400/70 mb-1">
              Función: withdrawETH() / withdrawToken()
            </p>
            <p className="card-text">
              Retira fondos de ETH o tokens (solo disponible para administradores).
            </p>
          </Link>
        </div>

        {/* Tercera fila */}
        <div className="card-row">
          <Link href="/treasury/supported" className="card">
            <div className="card-title">🪙 Tokens soportados</div>
            <p className="text-xs text-green-400/70 mb-1">
              Función: getSupportedTokens() / addSupportedToken()
            </p>
            <p className="card-text">
              Consulta y administra la lista de tokens aceptados en la DApp.
            </p>
          </Link>
          <Link href="/treasury/history" className="card">
            <div className="card-title">📜 Historial</div>
            <p className="text-xs text-green-400/70 mb-1">Función: transactions()</p>
            <p className="card-text">
              Revisa las últimas transacciones realizadas en la tesorería.
            </p>
          </Link>
          <Link href="/treasury/multitransfer" className="card">
            <div className="card-title">⚡ Multi-Transfer</div>
            <p className="text-xs text-green-400/70 mb-1">Función: multiTransfer()</p>
            <p className="card-text">
              Distribuye tokens a múltiples direcciones en una sola operación.
            </p>
          </Link>
        </div>

        {/* Cuarta fila */}
        <div className="card-row">
          
        </div>
      </div>
    </main>
  );
}

