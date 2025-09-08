//src/utils/providers.ts
import { JsonRpcProvider } from "ethers";
import dotenv from "dotenv";
dotenv.config(); // 👈 asegura que RPC_URL esté cargado
const RPC_URL = process.env.RPC_URL;
if (!RPC_URL) {
    throw new Error("⚠️ Falta RPC_URL en .env");
}
export const provider = new JsonRpcProvider(RPC_URL);
