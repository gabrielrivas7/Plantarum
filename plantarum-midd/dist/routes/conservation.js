//src/routes/conservation.ts
import { Router } from "express";
import multer from "multer";
import { handleTokenization } from "../services/tokenService.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * 🔹 POST /api/conservation
 * Maneja subida de metadata + archivos para conservación
 */
router.post("/", upload.array("files"), async (req, res) => {
    return handleTokenization("conservation", req, res);
});
/**
 * 🔹 Healthcheck específico
 */
router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "conservation",
        ts: Date.now(),
    });
});
export default router;
