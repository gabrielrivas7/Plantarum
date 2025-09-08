//src/services/tokenService.ts
import { Request, Response } from "express";
import { pinJSONToPinata, pinBase64ToPinata } from "./ipfsService.js";

interface TokenizationResult {
  ok: boolean;
  type: string;
  IpfsHash?: string;
  error?: string;
}

// ----------------------------
// Servicio genérico de tokenización
// ----------------------------
export async function handleTokenization(
  type: "forest" | "conservation" | "projects" | "carbon" | "kyc",
  req: Request,
  res: Response
): Promise<Response<TokenizationResult>> {
  try {
    // 1. Recibir metadata JSON
    const { metadata } = req.body;
    if (!metadata) {
      return res.status(400).json({ ok: false, type, error: "Falta metadata" });
    }

    const parsedMeta = JSON.parse(metadata);

    // 2. Procesar archivos
    const filesMeta: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const buffer = (file as Express.Multer.File).buffer.toString("base64");
        const upload = await pinBase64ToPinata({
          filename: (file as Express.Multer.File).originalname,
          mimeType: (file as Express.Multer.File).mimetype,
          base64: buffer,
        });
        filesMeta.push({
          name: (file as Express.Multer.File).originalname,
          type: (file as Express.Multer.File).mimetype,
          IpfsHash: upload.IpfsHash,
        });
      }
    }

    // 3. Armar metadata final
    const finalMetadata = {
      type,
      ...parsedMeta,
      files: filesMeta,
      ts: Date.now(),
    };

    // 4. Subir metadata JSON completa a Pinata
    const pinned = await pinJSONToPinata(finalMetadata);

    return res.json({
      ok: true,
      type,
      IpfsHash: pinned.IpfsHash,
    });
  } catch (err: any) {
    console.error(`[TokenService] Error en ${type}:`, err.message);
    return res.status(500).json({ ok: false, type, error: err.message });
  }
}
