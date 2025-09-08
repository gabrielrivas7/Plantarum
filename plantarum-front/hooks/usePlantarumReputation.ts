//plantarum-front/hooks/usePlantarumReputation.ts

"use client";

import { useState } from "react";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import PlantarumReputationABI from "@/abi/PlantarumReputation.json";

export const useReputation = () => {
  const [loading, setLoading] = useState(false);

  // Conectar contrato
  const getContract = async () => {
    if (!(window as any).ethereum) throw new Error("⚠️ Instala MetaMask");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      addresses.PlantarumReputation,
      PlantarumReputationABI,
      signer
    );
  };

  // 📌 Ver reputación
  const getReputation = async (user: string) => {
    const contract = await getContract();
    return await contract.getReputation(user);
  };

  // 📌 Aumentar reputación (solo DAO/SuperAdmin)
  const increaseReputation = async (user: string, amount: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.increaseReputation(user, amount);
      await tx.wait();
      return true;
    } finally {
      setLoading(false);
    }
  };

  // 📌 Disminuir reputación (solo DAO/SuperAdmin)
  const decreaseReputation = async (user: string, amount: number) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.decreaseReputation(user, amount);
      await tx.wait();
      return true;
    } finally {
      setLoading(false);
    }
  };

  return { getReputation, increaseReputation, decreaseReputation, loading };
};
