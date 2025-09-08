// src/routes/token.ts
import { Router } from "express";
import multer from "multer";
import { pinJSONToPinata, pinBase64ToPinata } from "../services/ipfsService.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * 🔹 POST /token/json
 * Recibe metadata JSON de tokenización y lo guarda en IPFS
 */
router.post("/json", async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ ok: false, error: "Falta metadata JSON" });
        }
        const result = await pinJSONToPinata(data);
        res.json({
            ok: true,
            IpfsHash: result.IpfsHash,
            PinSize: result.PinSize,
            Timestamp: result.Timestamp,
        });
    }
    catch (err) {
        console.error("❌ Error en /token/json:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});
/**
 * 🔹 POST /token/file
 * Recibe archivo (imagen/pdf) y lo guarda en IPFS
 */
router.post("/file", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, error: "No se subió ningún archivo" });
        }
        // Convertimos a base64 para reutilizar pinBase64ToPinata
        const base64 = req.file.buffer.toString("base64");
        const result = await pinBase64ToPinata({
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            base64,
        });
        res.json({
            ok: true,
            IpfsHash: result.IpfsHash,
            PinSize: result.PinSize,
            Timestamp: result.Timestamp,
        });
    }
    catch (err) {
        console.error("❌ Error en /token/file:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});
/**
 * 🔹 Healthcheck específico de token
 */
router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "tokenization",
        ts: Date.now(),
    });
});
export default router;
