//src/app/token/projects/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function ProjectsPage() {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    coords: "",
    coordsPoligono: "",
    supply: "",
    moneda: "",
    price: "",
    maturityDate: "",
    yieldPercent: "",
    phases: "",
    tipoProyecto: "",
    observaciones: "",
  });

  const [documentos, setDocumentos] = useState<File[]>([]);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(50);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setState: Function,
    multiple = false
  ) => {
    const files = e.target.files;
    if (!files) return;
    if (multiple) setState(Array.from(files));
    else setState([files[0]]);
  };

  // 📝 Contador descripción
  const handleDescripcion = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.trim().split(/\s+/);
    if (words.length <= 50) {
      setForm({ ...form, descripcion: e.target.value });
      setWordCount(50 - words.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 1️⃣ Subir metadata off-chain
      const formData = new FormData();
      formData.append("metadata", JSON.stringify({ ...form, type: "project" }));
      documentos.forEach((d) => formData.append("files", d));
      imagenes.forEach((i) => formData.append("files", i));

      const res = await fetch("http://localhost:4000/api/projects", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error en middleware");

      const cid = data.IpfsHash;
      const tokenURI = `ipfs://${cid}`;

      // 2️⃣ Conectar contrato
      if (!(window as any).ethereum) throw new Error("Instala MetaMask");
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum1155,
        Plantarum1155ABI,
        signer
      );

      const userAddress = await signer.getAddress();
      const hashId = crypto.randomUUID();
      const maturityTimestamp = Math.floor(new Date(form.maturityDate).getTime() / 1000);

      // 3️⃣ Ejecutar mint
      const tx = await contract.mintProject(
        userAddress,
        hashId,
        form.coords,
        tokenURI,
        parseInt(form.supply),
        ethers.parseEther(form.price || "0"),
        maturityTimestamp,
        parseFloat(form.yieldPercent),
        parseInt(form.phases)
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      alert("✅ Proyecto Forestal tokenizado correctamente.");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error en tokenización: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-2 text-center text-green-400">
        🌲 Tokenizar Proyectos Forestales
      </h2>
      <p className="text-center text-green-200 mb-6">
        Completa los campos para tokenizar proyectos forestales vinculados a inversión y rendimiento.
      </p>

      <div
        style={{
          backgroundColor: "#064e3b",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {/* Título */}
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            type="text"
            placeholder="Título del Proyecto"
            className="input-dark"
            required
          />

          {/* Descripción */}
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleDescripcion}
            placeholder="Descripción breve (máx 50 palabras)"
            className="input-dark"
            style={{ minHeight: "60px" }}
          />
          <p className="text-sm text-gray-300">Palabras restantes: {wordCount}</p>

          {/* Coordenadas */}
          <input
            name="coords"
            value={form.coords}
            onChange={handleChange}
            type="text"
            placeholder="Coordenadas principales (lat,lng)"
            className="input-dark"
            required
          />
          {form.coords && (
            <textarea
              name="coordsPoligono"
              value={form.coordsPoligono}
              onChange={handleChange}
              placeholder="Introduce puntos del polígono (lat,lng separados por comas)"
              className="input-dark"
              style={{ minHeight: "80px" }}
            />
          )}

          {/* Documentación */}
          <div
            className="input-dark"
            style={{ padding: "12px", cursor: "pointer" }}
            onClick={() => document.getElementById("documentos")?.click()}
          >
            <span>📑 Documentación (PDF máx 2MB, múltiples)</span>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
              {documentos.length > 0
                ? `${documentos.length} archivo(s) seleccionado(s)`
                : "Ningún archivo seleccionado"}
            </span>
            <input
              id="documentos"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => handleFileChange(e, setDocumentos, true)}
              style={{ display: "none" }}
            />
          </div>

          {/* Imágenes */}
          <div
            className="input-dark"
            style={{ padding: "12px", cursor: "pointer" }}
            onClick={() => document.getElementById("imagenes")?.click()}
          >
            <span>🖼️ Imágenes / Planos (PNG/JPG máx 2MB)</span>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
              {imagenes.length > 0
                ? `${imagenes.length} archivo(s) seleccionado(s)`
                : "Ningún archivo seleccionado"}
            </span>
            <input
              id="imagenes"
              type="file"
              accept=".png,.jpg"
              multiple
              onChange={(e) => handleFileChange(e, setImagenes, true)}
              style={{ display: "none" }}
            />
          </div>

          {/* Tipo de proyecto */}
          <input
            name="tipoProyecto"
            value={form.tipoProyecto}
            onChange={handleChange}
            type="text"
            placeholder="Tipo de proyecto (ej. Reforestación industrial, mixta)"
            className="input-dark"
          />

          {/* Observaciones */}
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Riesgos u observaciones adicionales"
            className="input-dark"
            style={{ minHeight: "60px" }}
          />

          {/* Supply */}
          <input
            name="supply"
            value={form.supply}
            onChange={handleChange}
            type="number"
            min={1}
            step={1}
            placeholder="Cantidad de tokens (supply ≥ 1)"
            className="input-dark"
            required
          />

          {/* Moneda */}
          <select
            name="moneda"
            value={form.moneda}
            onChange={handleChange}
            className="input-dark"
            required
          >
            <option value="">Selecciona moneda</option>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="PLNTX">PLNTX</option>
          </select>

          {/* Precio */}
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            min={1}
            step="0.01"
            placeholder="💰 Precio unitario"
            className="input-dark"
            required
            disabled={!form.moneda}
          />

          {/* Maturity */}
          <input
            name="maturityDate"
            value={form.maturityDate}
            onChange={handleChange}
            type="date"
            className="input-dark"
            required
          />

          {/* Rendimiento */}
          <input
            name="yieldPercent"
            value={form.yieldPercent}
            onChange={handleChange}
            type="number"
            min={1}
            step="0.1"
            placeholder="Rendimiento esperado (%)"
            className="input-dark"
            required
          />

          {/* Fases */}
          <select
            name="phases"
            value={form.phases}
            onChange={handleChange}
            className="input-dark"
            required
          >
            <option value="">Selecciona nº de fases</option>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} fase{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-green w-full mt-4">
            🌲 Tokenizar Proyecto Forestal
          </button>
        </form>

        {loading && <p className="text-yellow-400 mt-4 text-center">⏳ Procesando...</p>}
        {txHash && (
          <p className="text-green-400 mt-4 text-center">
            ✅ NFT minteado. TX Hash:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              className="underline"
            >
              {txHash}
            </a>
          </p>
        )}
      </div>

      {/* Botón volver */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/token"
          className="px-6 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white shadow-md"
        >
          ← Volver a Tokenización
        </Link>
      </div>
    </main>
  );
}
