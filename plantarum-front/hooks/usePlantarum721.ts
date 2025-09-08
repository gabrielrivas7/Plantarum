// hooks/usePlantarum721.ts
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Plantarum721ABI from "../abi/Plantarum721.json";
import addresses from "../utils/addresses_eth";
import { useWallet } from "../src/context/WalletContext";

export function usePlantarum721() {
  const { account, signer } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // --------------------------
  // Init contrato
  // --------------------------
  useEffect(() => {
    if (!signer) return;

    const c = new ethers.Contract(
      addresses.Plantarum721,
      Plantarum721ABI,
      signer
    );
    setContract(c);
  }, [signer]);

  // --------------------------
  // Mint
  // --------------------------
  const mintConservation = useCallback(
    async (to: string, hashId: string, coords: string, tokenURI: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet para mintear");
      try {
        const tx = await contract.mintConservation(to, hashId, coords, tokenURI);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en mintConservation:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  const mintForestAsset = useCallback(
    async (to: string, hashId: string, coords: string, tokenURI: string, price: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet para mintear");
      try {
        const value = ethers.parseEther(price); // precio en ETH
        const tx = await contract.mintForestAsset(to, hashId, coords, tokenURI, value);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en mintForestAsset:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  // --------------------------
  // Venta directa
  // --------------------------
  const listForSale = useCallback(
    async (tokenId: number, price: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      try {
        const value = ethers.parseEther(price);
        const tx = await contract.listForSale(tokenId, value);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en listForSale:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  const cancelSale = useCallback(
    async (tokenId: number) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      try {
        const tx = await contract.cancelSale(tokenId);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en cancelSale:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  const buyNow = useCallback(
    async (tokenId: number, price: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      try {
        const value = ethers.parseEther(price);
        const tx = await contract.buyNow(tokenId, { value });
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en buyNow:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  // --------------------------
  // Subastas
  // --------------------------
  const startAuction = useCallback(
    async (tokenId: number, basePrice: string, durationSeconds: number) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      try {
        const value = ethers.parseEther(basePrice);
        const tx = await contract.startAuction(tokenId, value, durationSeconds);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en startAuction:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  const placeBid = useCallback(
    async (tokenId: number, bid: string) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      try {
        const value = ethers.parseEther(bid);
        const tx = await contract.placeBid(tokenId, { value });
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en placeBid:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  const finalizeAuction = useCallback(
    async (tokenId: number) => {
      if (!contract || !signer) throw new Error("⚠️ Conecta tu wallet");
      try {
        const tx = await contract.finalizeAuction(tokenId);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en finalizeAuction:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  // --------------------------
  // DAO control
  // --------------------------
  const daoBurn = useCallback(
    async (tokenId: number) => {
      if (!contract || !signer) throw new Error("⚠️ Solo DAO/SuperAdmin puede quemar");
      try {
        const tx = await contract.daoBurn(tokenId);
        await tx.wait();
        return tx.hash;
      } catch (err) {
        console.error("❌ Error en daoBurn:", err);
        throw err;
      }
    },
    [contract, signer]
  );

  const pause = useCallback(async () => {
    if (!contract || !signer) throw new Error("⚠️ Solo SuperAdmin puede pausar");
    try {
      const tx = await contract.pause();
      await tx.wait();
      return tx.hash;
    } catch (err) {
      console.error("❌ Error en pause:", err);
      throw err;
    }
  }, [contract, signer]);

  const unpause = useCallback(async () => {
    if (!contract || !signer) throw new Error("⚠️ Solo SuperAdmin puede despausar");
    try {
      const tx = await contract.unpause();
      await tx.wait();
      return tx.hash;
    } catch (err) {
      console.error("❌ Error en unpause:", err);
      throw err;
    }
  }, [contract, signer]);

  // --------------------------
  // Getters
  // --------------------------
  const getTokenMeta = useCallback(
    async (tokenId: number) => {
      if (!contract) return null;
      const meta = await contract.getTokenMeta(tokenId);
      return {
        walletOwner: meta.walletOwner,
        hashId: meta.hashId,
        coords: meta.coords,
        timestamp: Number(meta.timestamp),
        price: Number(meta.price),
        listed: meta.listed,
        isAuction: meta.isAuction,
        auctionDeadline: Number(meta.auctionDeadline),
      };
    },
    [contract]
  );

  const getTokensByOwner = useCallback(
    async (owner: string) => {
      if (!contract) return [];
      const ids: bigint[] = await contract.getTokensByOwner(owner);
      return ids.map((id) => Number(id));
    },
    [contract]
  );

  const getAllTokens = useCallback(async () => {
    if (!contract) return [];
    const ids: bigint[] = await contract.getAllTokens();
    return ids.map((id) => Number(id));
  }, [contract]);

  return {
    account,
    contract,
    // Mint
    mintConservation,
    mintForestAsset,
    // Venta directa
    listForSale,
    cancelSale,
    buyNow,
    // Subastas
    startAuction,
    placeBid,
    finalizeAuction,
    // DAO Control
    daoBurn,
    pause,
    unpause,
    // Getters
    getTokenMeta,
    getTokensByOwner,
    getAllTokens,
  };
}

