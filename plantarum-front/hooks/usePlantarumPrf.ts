// hooks/usePlantarumPRF.ts
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import PRFABI from "@/abi/PlantarumPrf.json";
import addresses from "@/utils/addresses_eth";

const PRF_ADDRESS = addresses.PlantarumPrf;

export default function usePlantarumPRF() {
  const [loading, setLoading] = useState(false);

  const getContract = async () => {
    if (!(window as any).ethereum) throw new Error("⚠️ Wallet no detectada");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(PRF_ADDRESS, PRFABI, signer);
  };

  // 🔹 Registrar nuevo auditor
  const registerAuditor = async (auditor: string) => {
    const contract = await getContract();
    const tx = await contract.registerAuditor(auditor);
    return tx.wait();
  };

  // 🔹 Obtener auditores
  const getAuditors = async (): Promise<string[]> => {
    const contract = await getContract();
    return contract.getAuditors();
  };

  // 🔹 Crear auditoría (se dispara desde DAO o Admin)
  const createAudit = async (tokenId: number, creator: string) => {
    const contract = await getContract();
    const tx = await contract.createAudit(tokenId, creator);
    return tx.wait();
  };

  // 🔹 Aceptar auditoría
  const acceptAudit = async (auditId: number) => {
    const contract = await getContract();
    const tx = await contract.acceptAudit(auditId);
    return tx.wait();
  };

  // 🔹 Subir documento por fase
  const submitDocument = async (auditId: number, phase: number, ipfsHash: string) => {
    const contract = await getContract();
    const tx = await contract.submitDocument(auditId, phase, ipfsHash);
    return tx.wait();
  };

  // 🔹 Finalizar auditoría
  const finalizeAudit = async (auditId: number, opinion: string) => {
    const contract = await getContract();
    const tx = await contract.finalizeAudit(auditId, opinion);
    return tx.wait();
  };

  // 🔹 Obtener todas las auditorías
  const getAllAudits = async () => {
    const contract = await getContract();
    return contract.getAllAudits();
  };

  return {
    loading,
    registerAuditor,
    getAuditors,
    createAudit,
    acceptAudit,
    submitDocument,
    finalizeAudit,
    getAllAudits,
  };
}
