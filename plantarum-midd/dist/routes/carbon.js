//src/routes/carbon.ts
import { Router } from "express";
import multer from "multer";
import { handleTokenization } from "../services/tokenService.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * 🔹 POST /api/carbon
 * Maneja subida de metadata + archivos para créditos de carbono
 */
router.post("/", upload.array("files"), async (req, res) => {
    return handleTokenization("carbon", req, res);
});
/**
 * 🔹 Healthcheck específico
 */
router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "carbon",
        ts: Date.now(),
    });
});
export default router;
