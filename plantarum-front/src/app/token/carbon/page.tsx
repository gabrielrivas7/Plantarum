// src/app/token/carbon/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum1155ABI from "@/abi/Plantarum1155.json";

export default function CarbonPage() {
  const [form, setForm] = useState<any>({
    titulo: "",
    coords: "",
    coordsPoligono: "",
    supply: "",
    moneda: "",
    price: "",
    standard: "",
    projectType: "",
    vintage: "",
    verificationBody: "",
    expiryDate: "",
    certificadoCarbono: null,
  });

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 🔎 Validaciones estrictas
      if (!form.titulo.trim()) throw new Error("El título es obligatorio.");
      if (!form.coords.trim())
        throw new Error("Las coordenadas iniciales son obligatorias.");
      if (form.coordsPoligono.trim() && !form.coords.trim())
        throw new Error("Debes definir coordenadas base antes de los polígonos.");
      if (!form.supply || isNaN(Number(form.supply)) || Number(form.supply) <= 0)
        throw new Error("El supply debe ser un número válido mayor que 0.");
      if (!form.moneda) throw new Error("Debes seleccionar una moneda.");
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
        throw new Error("El precio unitario debe ser un número válido mayor que 0.");
      if (!form.standard) throw new Error("Debes seleccionar un estándar.");
      if (!form.expiryDate) throw new Error("Debes indicar la fecha de expiración.");
      if (!form.certificadoCarbono)
        throw new Error("Debes cargar un certificado de validación en PDF.");

      setLoading(true);

      // 1️⃣ Subir metadata off-chain
      const formData = new FormData();
      formData.append("metadata", JSON.stringify({ ...form, type: "carbon" }));
      if (form.certificadoCarbono) {
        formData.append("files", form.certificadoCarbono);
      }

      const res = await fetch("http://localhost:4000/api/carbon", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error en middleware");

      const cid = data.IpfsHash;
      const tokenURI = `ipfs://${cid}`;

      // 2️⃣ Conectar a contrato
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
      const expiryTimestamp = Math.floor(
        new Date(form.expiryDate).getTime() / 1000
      );

      // 3️⃣ Ejecutar mint
      const tx = await contract.mintCarbon(
        userAddress,
        hashId,
        form.coords,
        tokenURI,
        parseInt(form.supply),
        ethers.parseEther(form.price.toString()),
        form.standard,
        form.projectType,
        parseInt(form.vintage || "1"),
        form.verificationBody,
        expiryTimestamp
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      alert("✅ Crédito de Carbono tokenizado correctamente.");
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
        🌍 Tokenizar Créditos de Carbono
      </h2>
      <p className="text-center text-green-200 mb-6">
        Completa los campos para emitir créditos de carbono vinculados a
        estándares internacionales.
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
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            type="text"
            placeholder="Título del Proyecto"
            className="input-dark"
            required
          />

          <input
            name="coords"
            value={form.coords}
            onChange={handleChange}
            type="text"
            placeholder="Coordenadas (lat,lng)"
            className="input-dark"
            required
          />
          <textarea
            name="coordsPoligono"
            value={form.coordsPoligono}
            onChange={handleChange}
            placeholder="Introduce puntos del polígono (lat,lng separados por comas)"
            className="input-dark"
            style={{ minHeight: "80px" }}
          />

          <input
            name="supply"
            value={form.supply}
            onChange={handleChange}
            type="number"
            min="1"
            step="1"
            placeholder="Cantidad de créditos (supply)"
            className="input-dark"
            required
          />

          <select
            name="moneda"
            value={form.moneda}
            onChange={handleChange}
            className="input-dark"
            required
          >
            <option value="">Selecciona moneda de emisión</option>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
            <option value="PLNTX">PLNTX</option>
          </select>

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            min="1"
            step="0.01"
            placeholder="💲 Precio unitario"
            className="input-dark"
            disabled={!form.moneda}
            required
          />

          <select
            name="standard"
            value={form.standard}
            onChange={handleChange}
            className="input-dark"
            required
          >
            <option value="">Selecciona estándar</option>
            <option value="Verra">Verra</option>
            <option value="Gold Standard">Gold Standard</option>
            <option value="ISO 14064">ISO 14064</option>
            <option value="ISO 14064-2">ISO 14064-2</option>
          </select>

          <input
            name="projectType"
            value={form.projectType}
            onChange={handleChange}
            type="text"
            placeholder="Tipo de proyecto (ej. Reforestación, REDD+)"
            className="input-dark"
            required
          />

          <input
            name="vintage"
            value={form.vintage}
            onChange={handleChange}
            type="number"
            min="1"
            step="1"
            placeholder="Años de vigencia del crédito"
            className="input-dark"
            required
          />

          <input
            name="verificationBody"
            value={form.verificationBody}
            onChange={handleChange}
            type="text"
            placeholder="Entidad certificadora"
            className="input-dark"
            required
          />

          <div
            className="input-dark"
            style={{
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("certificadoCarbono")?.click()}
          >
            <span>📑 Cargar Certificado de Validación (PDF máx 2MB)</span>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
              {form.certificadoCarbono
                ? form.certificadoCarbono.name
                : "Ningún archivo seleccionado"}
            </span>
            <input
              id="certificadoCarbono"
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setForm({
                  ...form,
                  certificadoCarbono: e.target.files
                    ? e.target.files[0]
                    : null,
                })
              }
              style={{ display: "none" }}
              required
            />
          </div>

          <input
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            type="date"
            className="input-dark"
            required
          />

          <button type="submit" className="btn-green w-full mt-4">
            🌍 Tokenizar Créditos de Carbono
          </button>
        </form>

        {loading && (
          <p className="text-yellow-400 mt-4 text-center">⏳ Procesando...</p>
        )}
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
