//src/app/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);

        // 🔑 Primero revisamos si ya hay cuentas conectadas
        const accounts = await provider.send("eth_accounts", []);
        let signer;

        if (accounts.length > 0) {
          // ✅ Ya hay cuentas autorizadas
          signer = await provider.getSigner();
        } else {
          // 🟡 Pedir conexión si no hay ninguna
          await provider.send("eth_requestAccounts", []);
          signer = await provider.getSigner();
        }

        const userAddress = await signer.getAddress();

        const contract = new ethers.Contract(
          addresses.Plantarum721,
          Plantarum721ABI,
          signer
        );

        // Hash del rol SUPER_ADMIN_ROLE
        const SUPER_ADMIN_ROLE = ethers.keccak256(
          ethers.toUtf8Bytes("SUPER_ADMIN_ROLE")
        );

        // Verificar si el usuario tiene el rol
        const hasSuperRole = await contract.hasRole(
          SUPER_ADMIN_ROLE,
          userAddress
        );

        if (hasSuperRole) {
          setIsAdmin(true);
        }
      } catch (err: any) {
        if (err.code === -32002) {
          alert("⚠️ Ya hay una solicitud de conexión pendiente en MetaMask. Revisa tu extensión.");
        } else {
          console.error("❌ Error verificando admin:", err);
        }
      }
    };

    checkAdmin();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🌱 Bienvenido a Plantarum
      </h2>
      <p className="text-center max-w-2xl mb-12">
        Plataforma descentralizada para la tokenización y gobernanza de recursos
        forestales 🌍. Explora los módulos principales y empieza a interactuar
        con el ecosistema.
      </p>

      {/* Cards agrupadas en filas */}
      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <Link href="/dao" className="card">
            <div className="card-title">🌱 DAO</div>
            <p className="card-text">
              Participa en la gobernanza forestal. Propón, vota y decide el
              futuro.
            </p>
          </Link>

          <Link href="/token" className="card">
            <div className="card-title">🌳 Tokenización</div>
            <p className="card-text">
              Tokeniza bosques, activos forestales, proyectos e inicia créditos
              de carbono.
            </p>
          </Link>
        </div>

        {/* Segunda fila */}
        <div className="card-row">
          <Link href="/marketplace" className="card">
            <div className="card-title">🛒 Marketplace</div>
            <p className="card-text">
              Compra y vende activos tokenizados: árboles, bosques y créditos de
              carbono.
            </p>
          </Link>
          <Link href="/map" className="card">
            <div className="card-title">🗺️ Mapa</div>
            <p className="card-text">
              Explora los recursos forestales en un mapa interactivo global.
            </p>
          </Link>
        </div>

        {/* Tercera fila */}
        <div className="card-row">
          <Link href="/treasury" className="card">
            <div className="card-title">🏦 Treasury</div>
            <p className="card-text">
              Consulta balances, supply y transacciones de la tesorería.
            </p>
          </Link>
          <Link href="/faucet" className="card">
            <div className="card-title">💧 Faucet</div>
            <p className="card-text">
              Reclama tokens de prueba (PLTNX) y comienza a interactuar.
            </p>
          </Link>
        </div>

        {/* Cuarta fila */}
        <div className="card-row">
          <Link href="/info" className="card">
            <div className="card-title">ℹ️ Info</div>
            <p className="card-text">
              Aprende sobre el ecosistema, documentos y recursos oficiales.
            </p>
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="card">
              <div className="card-title">🔒 Admin</div>
              <p className="card-text">
                Panel de configuración de fees, roles y parámetros críticos.
              </p>
            </Link>
          ) : (
            <div className="card card-admin">
              <div className="card-title">🔒 Admin</div>
              <p className="card-text">
                Acceso restringido. Solo disponible para administradores.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


