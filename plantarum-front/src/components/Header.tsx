"use client";

import Link from "next/link";
import Jazzicon from "@metamask/jazzicon";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "../context/WalletContext";

export default function Header() {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const iconRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Crear avatar cuando hay cuenta
  useEffect(() => {
    if (account && iconRef.current) {
      iconRef.current.innerHTML = "";
      const seed = parseInt(account.slice(2, 10), 16);
      const icon = Jazzicon(24, seed);
      iconRef.current.appendChild(icon);
    }
  }, [account]);

  return (
    <header style={{ backgroundColor: "#111827", padding: "12px 24px" }}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-green-400 font-bold text-xl">
          <Link href="/">🌲 Plantarum</Link>
        </div>

        {/* Botón hamburguesa SOLO visible en móviles */}
        <button
          className="lg:hidden text-green-400 text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>

        {/* Menú normal en pantallas grandes */}
        <nav className="hidden lg:flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/dao">DAO</Link>
          <Link href="/token">Token</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link
            href="/token/conservation/natura"
            className="text-green-400 font-bold hover:underline"
          >
            🌳 Natura
          </Link>
          <Link href="/map">Mapa</Link>
          <Link href="/faucet">Faucet</Link>
          <Link href="/treasury">Tesoro</Link>
          <Link href="/info">Info</Link>
        </nav>

        {/* Wallet */}
        <div className="hidden lg:flex items-center">
          {!account ? (
            <button onClick={connectWallet} className="ml-4 text-green-400">
              🔗 Conectar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div ref={iconRef} />
              <span className="text-green-300">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button onClick={disconnectWallet} className="ml-2 text-red-400">
                ❌
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menú desplegable en móviles */}
      {isOpen && (
        <div className="lg:hidden flex flex-col items-center mt-3 gap-3">
          <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/dao" onClick={() => setIsOpen(false)}>DAO</Link>
          <Link href="/token" onClick={() => setIsOpen(false)}>Token</Link>
          <Link href="/marketplace" onClick={() => setIsOpen(false)}>Marketplace</Link>
          <Link
            href="/token/conservation/natura"
            onClick={() => setIsOpen(false)}
            className="text-green-400 font-bold"
          >
            🌳 Natura
          </Link>
          <Link href="/map" onClick={() => setIsOpen(false)}>Mapa</Link>
          <Link href="/faucet" onClick={() => setIsOpen(false)}>Faucet</Link>
          <Link href="/treasury" onClick={() => setIsOpen(false)}>Treasury</Link>
          <Link href="/info" onClick={() => setIsOpen(false)}>Info</Link>

          {/* Wallet en móviles */}
          {!account ? (
            <button onClick={connectWallet} className="mt-2 text-green-400">
              🔗 Conectar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div ref={iconRef} />
              <span className="text-green-300">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button onClick={disconnectWallet} className="ml-2 text-red-400">
                ❌
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}



