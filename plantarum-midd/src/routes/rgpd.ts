// src/routes/rgpd.ts
import { Router } from "express";
import { storePersonalData, getPersonalData, deletePersonalData } from "../services/rgpdService.js";

const router = Router();

// 📌 Guardar dato personal
router.post("/store", (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ ok: false, error: "Falta 'data'" });

    const { hashId } = storePersonalData(data);
    res.json({ ok: true, hashId });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 📌 Obtener dato por hashId
router.get("/:hashId", (req, res) => {
  try {
    const result = getPersonalData(req.params.hashId);
    if (!result) return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true, data: result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 📌 Borrar dato (derecho al olvido)
router.delete("/:hashId", (req, res) => {
  try {
    const success = deletePersonalData(req.params.hashId);
    if (!success) return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true, message: "Dato eliminado según RGPD" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
