// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function AdminPage() {
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

        const SUPER_ADMIN_ROLE = ethers.keccak256(
          ethers.toUtf8Bytes("SUPER_ADMIN_ROLE")
        );

        const hasSuperRole = await contract.hasRole(
          SUPER_ADMIN_ROLE,
          userAddress
        );

        if (hasSuperRole) setIsAdmin(true);
      } catch (err) {
        console.error("❌ Error verificando admin:", err);
      }
    };

    checkAdmin();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-[75vh] px-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🔒 Panel de Administración</h2>
      <p className="text-center max-w-2xl mb-12">
        Configura los parámetros críticos del ecosistema{" "}
        <span className="text-green-400 font-bold">Plantarum</span>.  
        Acceso exclusivo para wallets con rol de Super Admin o Multisig.
      </p>

      <div className="flex flex-col items-center">
        {/* Primera fila */}
        <div className="card-row">
          <Link href="/admin/fees" className="card">
            <div className="card-title">⚙️ Fees y Monedas</div>
            <p className="card-text">
              Configura las comisiones de venta.  
              Agrega nuevas monedas ERC20 aceptadas en el marketplace.
            </p>
          </Link>

          <Link href="/admin/adminrole" className="card">
            <div className="card-title">👤 Roles de Administración</div>
            <p className="card-text">
              Gestiona permisos especiales para wallets:  
              Super Admin, Multisig y roles delegados.
            </p>
          </Link>
        </div>

        {/* Segunda fila con Carbon y Projects */}
        <div className="card-row">
          {isAdmin ? (
            <Link href="/admin/carbon" className="card">
              <div className="card-title">🌍 Créditos de Carbono</div>
              <p className="card-text">
                Administra la tokenización de créditos de carbono:  
                comisiones, monedas, y control de emisiones.
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
            <Link href="/admin/projects" className="card">
              <div className="card-title">🏭 Proyectos Forestales</div>
              <p className="card-text">
                Administra proyectos de inversión forestal:  
                fases, vencimientos y utilidades.
              </p>
            </Link>
          ) : (
            <div className="card card-admin">
              <div className="card-title">🏭 Proyectos Forestales</div>
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
