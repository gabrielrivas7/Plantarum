// src/app/token/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function TokenPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!(window as any).ethereum) return;

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const contract = new ethers.Contract(
          addresses.Plantarum1155,
          Plantarum1155ABI,
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
      } catch (err) {
        console.error("❌ Error verificando admin:", err);
      }
    };

    checkAdmin();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🌳 Tokenización Forestal</h2>
      <p className="text-center max-w-2xl mb-12">
        Elige el tipo de tokenización que deseas realizar: conservación, activos forestales, 
        créditos de carbono o proyectos de industrialización. Cada categoría está 
        regulada por la DAO y sus respectivos comités.
      </p>

      {/* Cards agrupadas en filas */}
      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <Link href="/token/conservation" className="card">
            <div className="card-title">🌱 Conservación</div>
            <p className="card-text">
              Tokeniza áreas protegidas y reservas forestales bajo protocolos de conservación.
            </p>
          </Link>
          <Link href="/token/forest" className="card">
            <div className="card-title">🌲 Activos Forestales</div>
            <p className="card-text">
              Tokeniza lotes, árboles y recursos forestales para venta o subasta en el marketplace.
            </p>
          </Link>
        </div>

        {/* Segunda fila */}
        <div className="card-row">
          {isAdmin ? (
            <Link href="/token/carbon" className="card">
              <div className="card-title">🌍 Créditos de Carbono</div>
              <p className="card-text">
                Genera créditos de carbono vinculados a proyectos certificados y validados.
              </p>
            </Link>
          ) : (
            <div className="card card-admin">
              <div className="card-title">🌍 Créditos de Carbono</div>
              <p className="card-text">
                Acceso restringido. Solo disponible para administradores.
              </p>
            </div>
          )}

          {isAdmin ? (
            <Link href="/token/projects" className="card">
              <div className="card-title">🏭 Proyectos Forestales e Industriales</div>
              <p className="card-text">
                Tokeniza proyectos de explotación o industrialización forestal con lógica de inversión.
              </p>
            </Link>
          ) : (
            <div className="card card-admin">
              <div className="card-title">🏭 Proyectos Forestales e Industriales</div>
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


