"use client";

import { useState } from "react";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import PlantarumKYCABI from "@/abi/PlantarumKyc.json";

export const useKYC = () => {
  const [loading, setLoading] = useState(false);

  const getContract = async () => {
    if (!(window as any).ethereum) throw new Error("⚠️ Instala MetaMask");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(
      addresses.PlantarumKyc,
      PlantarumKYCABI,
      signer
    );
  };

  // 📌 Registrar KYC
  const registerKYC = async (user: string, hashId: string) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.registerKYC(user, hashId);
      await tx.wait();
      return true;
    } finally {
      setLoading(false);
    }
  };

  // 📌 Verificar si user tiene KYC válido
  const isKYCVerified = async (user: string) => {
    const contract = await getContract();
    return await contract.isKYCVerified(user);
  };

  // 📌 Revocar KYC
  const revokeKYC = async (user: string) => {
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.revokeKYC(user);
      await tx.wait();
      return true;
    } finally {
      setLoading(false);
    }
  };

  // 📌 Estado textual
  const getKYCStatus = async (user: string) => {
    const contract = await getContract();
    return await contract.getKYCStatus(user);
  };

  return { registerKYC, isKYCVerified, revokeKYC, getKYCStatus, loading };
};
