// src/routes/ipfs.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import pinataSDK from "@pinata/sdk";
import { PassThrough } from "stream";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------
// Definimos interfaz local para tipar pinata
// ----------------------
interface PinataClient {
  pinJSONToIPFS: (data: any, options?: any) => Promise<any>;
  pinFileToIPFS: (stream: NodeJS.ReadableStream, options?: any) => Promise<any>;
}

// ----------------------
// Configuración Pinata
// ----------------------
const pinata = new (pinataSDK as any)(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_API_KEY!
) as PinataClient;

// ----------------------
// Subir JSON a IPFS
// ----------------------
router.post("/json", async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ ok: false, error: "Falta data en el body" });
    }

    const result = await pinata.pinJSONToIPFS(data, {
      pinataMetadata: { name: "plantarum-json" },
    });

    res.json({
      ok: true,
      IpfsHash: result.IpfsHash,
      Timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Error subiendo JSON:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ----------------------
// Subir archivo a IPFS (imagen/pdf/etc.)
// ----------------------
router.post(
  "/file",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ ok: false, error: "No se subió ningún archivo" });
      }

      const bufferStream = new PassThrough();
      bufferStream.end(req.file.buffer);

      const result = await pinata.pinFileToIPFS(bufferStream, {
        pinataMetadata: { name: req.file.originalname },
      });

      res.json({
        ok: true,
        IpfsHash: result.IpfsHash,
        Name: req.file.originalname,
        Size: req.file.size,
        MimeType: req.file.mimetype,
        Timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("❌ Error subiendo archivo:", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);

export default router;
