// src/hooks/useRgpd.ts

"use client";

import { useState } from "react";
import { ethers } from "ethers";
import PlantarumRgpdABI from "@/abi/PlantarumRgpd.json";
import addresses from "@/utils/addresses_eth";

const CONTRACT_ADDRESS = addresses.PlantarumRgpd;

export const useRgpd = () => {
  const [loading, setLoading] = useState(false);

  // 🔹 Guardar hash
  const registerHash = async (hash: string): Promise<boolean> => {
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask no detectado");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PlantarumRgpdABI, signer);

      const tx = await contract.registerHash(hash);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("❌ Error en registerHash:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verificar hash
  const checkHash = async (hash: string): Promise<boolean> => {
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask no detectado");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PlantarumRgpdABI, provider);

      return await contract.isHashActive(hash);
    } catch (err) {
      console.error("❌ Error en checkHash:", err);
      return false;
    }
  };

  // 🔹 Eliminar hash
  const deleteHash = async (hash: string): Promise<boolean> => {
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask no detectado");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PlantarumRgpdABI, signer);

      const tx = await contract.deleteHash(hash);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("❌ Error en deleteHash:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { registerHash, checkHash, deleteHash, loading };
};
