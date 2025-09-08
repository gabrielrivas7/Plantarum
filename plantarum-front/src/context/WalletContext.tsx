// src/context/WalletContext.tsx

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

type WalletContextType = {
  account: string | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType>({
  account: null,
  signer: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("⚠️ Instala MetaMask para continuar.");
      return;
    }

    try {
      const ethereum = (window as any).ethereum;

      // 🔹 1. Forzar red Sepolia antes de conectar
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
        });
      } catch (switchError: any) {
        // 🔹 Si Sepolia no está añadida, la agregamos
        if (switchError.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // 🔹 2. Ahora sí creamos el provider
      const provider = new ethers.BrowserProvider(ethereum);

      // Ver si ya hay cuentas activas
      const existingAccounts = await provider.listAccounts();
      if (existingAccounts.length > 0) {
        setAccount(existingAccounts[0].address);
        setSigner(await provider.getSigner());
        console.log("⚡ Wallet ya conectada en Sepolia:", existingAccounts[0].address);
        return;
      }

      // 🔹 Si no hay, entonces pedimos permiso
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const signer = await provider.getSigner();
      setSigner(signer);

      console.log("✅ Wallet conectada en Sepolia:", accounts[0]);
    } catch (err) {
      console.error("❌ Error al conectar wallet:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    console.log("👋 Wallet desconectada");
  };

  // Eventos de MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      ethereum.on("chainChanged", (_chainId: string) => {
        console.log("🔄 Red cambiada:", _chainId);
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, signer, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

