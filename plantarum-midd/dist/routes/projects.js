//src/routes/projects.ts
import { Router } from "express";
import multer from "multer";
import { handleTokenization } from "../services/tokenService.js";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * 🔹 POST /api/projects
 * Maneja subida de metadata + archivos para proyectos industriales
 */
router.post("/", upload.array("files"), async (req, res) => {
    return handleTokenization("projects", req, res);
});
/**
 * 🔹 Healthcheck específico
 */
router.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "projects",
        ts: Date.now(),
    });
});
export default router;
