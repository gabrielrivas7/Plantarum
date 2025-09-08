// src/routes/forest.ts
import { Router } from "express";
import multer from "multer";
import { handleTokenization } from "../services/tokenService.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * 🔹 POST /api/forest
 * Maneja subida de metadata + archivos para ForestAssets
 * Incluye campo adicional: price (venta directa o subasta base)
 */
router.post("/", upload.array("files"), async (req, res) => {
    return handleTokenization("forest", req, res);
});
/**
 * 🔹 Healthcheck específico
 */
router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "forest",
        ts: Date.now(),
    });
});
export default router;
