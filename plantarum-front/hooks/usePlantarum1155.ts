"use client";

import { useState } from "react";
import { ethers } from "ethers";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";
import addresses from "@/utils/addresses_eth";

const CONTRACT_ADDRESS = addresses.Plantarum1155;

export default function usePlantarum1155() {
  const [loading, setLoading] = useState(false);

  // --------------------
  // Helpers
  // --------------------
  const getContract = async () => {
    if (!(window as any).ethereum) throw new Error("❌ Wallet no detectada");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, Plantarum1155ABI, signer);
  };

  // --------------------
  // Minting
  // --------------------
  const mintCarbon = async (
    to: string,
    hashId: string,
    coords: string,
    tokenURI: string,
    supply: number,
    price: string,
    standard: string,
    projectType: string,
    vintage: number,
    verificationBody: string,
    expiryDate: number
  ) => {
    const contract = await getContract();
    const tx = await contract.mintCarbon(
      to,
      hashId,
      coords,
      tokenURI,
      supply,
      ethers.parseEther(price),
      standard,
      projectType,
      vintage,
      verificationBody,
      expiryDate
    );
    return tx.wait();
  };

  const mintProject = async (
    to: string,
    hashId: string,
    coords: string,
    tokenURI: string,
    supply: number,
    price: string,
    maturityDate: number,
    yieldPercent: number,
    phases: number
  ) => {
    const contract = await getContract();
    const tx = await contract.mintProject(
      to,
      hashId,
      coords,
      tokenURI,
      supply,
      ethers.parseEther(price),
      maturityDate,
      yieldPercent,
      phases
    );
    return tx.wait();
  };

  // --------------------
  // Buy
  // --------------------
  const buyCarbon = async (tokenId: number, amount: number, price: string) => {
    const contract = await getContract();
    const total = ethers.parseEther((parseFloat(price) * amount).toString());
    const tx = await contract.buyCarbon(tokenId, amount, { value: total });
    return tx.wait();
  };

  const buyCarbonERC20 = async (
    tokenId: number,
    token: string,
    amount: number,
    paymentAmount: string
  ) => {
    const contract = await getContract();
    const tx = await contract.buyCarbonERC20(
      tokenId,
      token,
      amount,
      ethers.parseUnits(paymentAmount, 18)
    );
    return tx.wait();
  };

  const buyProject = async (tokenId: number, amount: number, price: string) => {
    const contract = await getContract();
    const total = ethers.parseEther((parseFloat(price) * amount).toString());
    const tx = await contract.buyProject(tokenId, amount, { value: total });
    return tx.wait();
  };

  const buyProjectERC20 = async (
    tokenId: number,
    token: string,
    amount: number,
    paymentAmount: string
  ) => {
    const contract = await getContract();
    const tx = await contract.buyProjectERC20(
      tokenId,
      token,
      amount,
      ethers.parseUnits(paymentAmount, 18)
    );
    return tx.wait();
  };

  // --------------------
  // List & Cancel
  // --------------------
  const listCarbonForSale = async (tokenId: number, price: string) => {
    const contract = await getContract();
    const tx = await contract.listCarbonForSale(tokenId, ethers.parseEther(price));
    return tx.wait();
  };

  const cancelCarbonSale = async (tokenId: number) => {
    const contract = await getContract();
    const tx = await contract.cancelCarbonSale(tokenId);
    return tx.wait();
  };

  const listProjectForSale = async (tokenId: number, price: string) => {
    const contract = await getContract();
    const tx = await contract.listProjectForSale(tokenId, ethers.parseEther(price));
    return tx.wait();
  };

  const cancelProjectSale = async (tokenId: number) => {
    const contract = await getContract();
    const tx = await contract.cancelProjectSale(tokenId);
    return tx.wait();
  };

  // --------------------
  // Getters
  // --------------------
  const getCarbonMeta = async (tokenId: number) => {
    const contract = await getContract();
    return contract.getCarbonMeta(tokenId);
  };

  const getProjectMeta = async (tokenId: number) => {
    const contract = await getContract();
    return contract.getProjectMeta(tokenId);
  };

  const getAllTokens = async () => {
    const contract = await getContract();
    return contract.getAllTokens();
  };

  const balanceOf = async (owner: string, tokenId: number) => {
    const contract = await getContract();
    return contract.balanceOf(owner, tokenId);
  };

  return {
    loading,
    mintCarbon,
    mintProject,
    buyCarbon,
    buyCarbonERC20,
    buyProject,
    buyProjectERC20,
    listCarbonForSale,
    cancelCarbonSale,
    listProjectForSale,
    cancelProjectSale,
    getCarbonMeta,
    getProjectMeta,
    getAllTokens,
    balanceOf,
  };
}
