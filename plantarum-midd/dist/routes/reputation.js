// src/routes/reputation.ts
import { Router } from "express";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";
import { provider } from "../utils/provider.js";
// ----------------------
// Path absoluto al ABI
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const abiPath = resolve(__dirname, "../abi/PlantarumReputation.json");
const ReputationABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
// Dirección del contrato desde .env
const REPUTATION_ADDRESS = process.env.REPUTATION_ADDRESS;
// Instancia contrato
const contract = new ethers.Contract(REPUTATION_ADDRESS, ReputationABI, provider);
const router = Router();
// ----------------------
// GET reputación simple
// ----------------------
router.get("/get/:user", async (req, res) => {
    try {
        const { user } = req.params;
        const reputation = await contract.getReputation(user);
        res.json({ ok: true, reputation: reputation.toString() });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
export default router;
