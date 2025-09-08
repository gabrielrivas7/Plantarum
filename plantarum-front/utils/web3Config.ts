// utils/web3Config.ts
import { ethers } from "ethers";

/**
 * 📌 Configuración de conexión Web3
 * - Provider: Alchemy (solo para lecturas sin firma)
 * - Signer: lo maneja WalletContext → nunca pedimos aquí eth_requestAccounts
 */

const alchemyUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "";
if (!alchemyUrl) {
  console.warn("⚠️ Falta configurar NEXT_PUBLIC_ALCHEMY_RPC_URL en .env.local");
}

// Provider general (Alchemy) → solo lectura
export const provider = new ethers.JsonRpcProvider(alchemyUrl);

// Nota: el signer ya NO se obtiene aquí.
// Usa useWallet() en frontend para obtener signer conectado.

