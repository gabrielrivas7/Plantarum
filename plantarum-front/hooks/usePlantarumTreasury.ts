// hooks/usePlantarumTreasury.ts

"use client";

import { useState } from "react";
import { ethers } from "ethers";
import TreasuryABI from "@/abi/PlantarumTreasury.json";
import addresses from "@/utils/addresses_eth";

const TREASURY_ADDRESS = addresses.PlantarumTreasury;

export default function usePlantarumTreasury() {
  const [loading, setLoading] = useState(false);

  // --------------------
  // Helpers
  // --------------------
  const getContract = async () => {
    if (!(window as any).ethereum) throw new Error("Wallet no detectada");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(TREASURY_ADDRESS, TreasuryABI, signer);
  };

  // --------------------
  // ETH
  // --------------------
  const depositETH = async (amountEth: string) => {
    const contract = await getContract();
    const tx = await contract.depositETH({ value: ethers.parseEther(amountEth) });
    return tx.wait();
  };

  const withdrawETH = async (to: string, amountEth: string) => {
    const contract = await getContract();
    const tx = await contract.withdrawETH(to, ethers.parseEther(amountEth));
    return tx.wait();
  };

  // --------------------
  // ERC20
  // --------------------
  const depositToken = async (token: string, amount: string) => {
    const contract = await getContract();
    const tx = await contract.depositToken(token, ethers.parseUnits(amount, 18));
    return tx.wait();
  };

  const withdrawToken = async (token: string, to: string, amount: string) => {
    const contract = await getContract();
    const tx = await contract.withdrawToken(token, to, ethers.parseUnits(amount, 18));
    return tx.wait();
  };

  // --------------------
  // Multi-Transfer
  // --------------------
  const multiTransferETH = async (recipients: string[], amounts: string[]) => {
    const contract = await getContract();
    const parsed = amounts.map((amt) => ethers.parseEther(amt));
    const tx = await contract.multiTransferETH(recipients, parsed);
    return tx.wait();
  };

  const multiTransferToken = async (token: string, recipients: string[], amounts: string[]) => {
    const contract = await getContract();
    const parsed = amounts.map((amt) => ethers.parseUnits(amt, 18));
    const tx = await contract.multiTransferToken(token, recipients, parsed);
    return tx.wait();
  };

  // --------------------
  // Reserves (Escrow)
  // --------------------
  const createReserve = async (
    token: string,
    beneficiary: string,
    amount: string,
    releaseDate: number
  ) => {
    const contract = await getContract();
    const tx = await contract.createReserve(token, beneficiary, ethers.parseUnits(amount, 18), releaseDate);
    return tx.wait();
  };

  const releaseReserve = async (reserveId: string) => {
    const contract = await getContract();
    const tx = await contract.releaseReserve(reserveId);
    return tx.wait();
  };

  const isReserveActive = async (reserveId: string): Promise<boolean> => {
    const contract = await getContract();
    return contract.isReserveActive(reserveId);
  };

  // --------------------
  // Emergency Stop & Sweep
  // --------------------
  const activateEmergencyStop = async () => {
    const contract = await getContract();
    const tx = await contract.activateEmergencyStop();
    return tx.wait();
  };

  const deactivateEmergencyStop = async () => {
    const contract = await getContract();
    const tx = await contract.deactivateEmergencyStop();
    return tx.wait();
  };

  const sweepToken = async (token: string, to: string) => {
    const contract = await getContract();
    const tx = await contract.sweepToken(token, to);
    return tx.wait();
  };

  // --------------------
  // Views
  // --------------------
  const getETHBalance = async (): Promise<string> => {
    const contract = await getContract();
    const bal = await contract.getETHBalance();
    return ethers.formatEther(bal);
  };

  const getTokenBalance = async (token: string): Promise<string> => {
    const contract = await getContract();
    const bal = await contract.getTokenBalance(token);
    return ethers.formatUnits(bal, 18);
  };

  const getSupportedTokens = async (): Promise<string[]> => {
    const contract = await getContract();
    return contract.getSupportedTokens();
  };

  const getAllBalances = async (): Promise<{ eth: string; tokens: string[] }> => {
    const contract = await getContract();
    const [ethBal, tokenBals] = await contract.getAllBalances();
    return {
      eth: ethers.formatEther(ethBal),
      tokens: tokenBals.map((b: bigint) => ethers.formatUnits(b, 18)),
    };
  };

  return {
    loading,
    depositETH,
    withdrawETH,
    depositToken,
    withdrawToken,
    multiTransferETH,
    multiTransferToken,
    createReserve,
    releaseReserve,
    isReserveActive,
    activateEmergencyStop,
    deactivateEmergencyStop,
    sweepToken,
    getETHBalance,
    getTokenBalance,
    getSupportedTokens,
    getAllBalances,
  };
}
