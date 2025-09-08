// hooks/usePlantarumToken.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import addresses from "../utils/addresses_eth";
import { provider } from "../utils/web3Config"; // ✅ solo lectura
import PlantarumTokenABI from "../abi/PlantarumToken.json";
import { useWallet } from "../src/context/WalletContext"; // ✅ signer viene del context

export function usePlantarumToken() {
  const { signer } = useWallet(); // 👈 usamos signer de WalletContext
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Inicializar contrato al tener signer
  useEffect(() => {
    if (signer) {
      const tokenContract = new ethers.Contract(
        addresses.PlantarumToken,
        PlantarumTokenABI,
        signer
      );
      setContract(tokenContract);
    }
  }, [signer]);

  async function getBalance(address: string): Promise<string> {
    if (!contract) return "0";
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  }

  async function faucet(): Promise<string> {
    if (!contract) throw new Error("Contrato no inicializado");
    const tx = await contract.faucet();
    await tx.wait();
    return tx.hash;
  }

  async function totalSupply(): Promise<string> {
    const tokenContract = new ethers.Contract(
      addresses.PlantarumToken,
      PlantarumTokenABI,
      provider // 🔹 solo lectura
    );
    const supply = await tokenContract.totalSupply();
    return ethers.formatUnits(supply, 18);
  }

  // 🔹 FIX approve → si el spender es "dao", sustituimos por la DAO real
  async function approve(spender: string, amount: string): Promise<string> {
    if (!contract) throw new Error("Contrato no inicializado");
    const value = ethers.parseUnits(amount, 18);

    const spenderAddress =
      spender === "dao" ? addresses.PlantarumDao : spender;

    const tx = await contract.approve(spenderAddress, value);
    await tx.wait();
    return tx.hash;
  }

  return { getBalance, faucet, totalSupply, approve };
}
