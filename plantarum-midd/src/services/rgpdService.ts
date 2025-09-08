// src/services/rgpdService.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_PATH = path.join(process.cwd(), "src", "storage", "rgpd");

// Asegura que la carpeta exista
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

/**
 * 🔹 Genera un hash único con salt
 */
function generateHash(data: string, salt: string): string {
  return crypto.createHash("sha256").update(data + salt).digest("hex");
}

/**
 * 🔹 Guardar datos personales off-chain (con hash en blockchain)
 */
export function storePersonalData(data: Record<string, any>) {
  const salt = crypto.randomBytes(16).toString("hex"); // clave secreta
  const hashId = generateHash(JSON.stringify(data), salt);

  const filePath = path.join(STORAGE_PATH, `${hashId}.json`);

  const payload = {
    salt,
    data,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

  return { hashId, filePath };
}

/**
 * 🔹 Obtener datos personales por hashId
 */
export function getPersonalData(hashId: string) {
  const filePath = path.join(STORAGE_PATH, `${hashId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * 🔹 Borrar datos personales (ejercicio de derecho al olvido)
 */
export function deletePersonalData(hashId: string) {
  const filePath = path.join(STORAGE_PATH, `${hashId}.json`);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  // 🚨 Destruimos la sal para que el hash quede "huérfano"
  const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  payload.salt = null;
  payload.data = null;
  payload.deletedAt = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

  return true;
}
