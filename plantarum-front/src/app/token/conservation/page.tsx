//src/app/token/conservation/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";


const comunidades: Record<string, string[]> = {
  Andalucía: ["Sevilla", "Málaga", "Granada", "Córdoba", "Cádiz", "Jaén", "Huelva", "Almería"],
  Cataluña: ["Barcelona", "Girona", "Lleida", "Tarragona"],
  Madrid: ["Madrid"],
  Valencia: ["Valencia", "Castellón", "Alicante"],
  Galicia: ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
  "Castilla y León": ["León", "Salamanca", "Burgos", "Zamora", "Valladolid", "Segovia", "Soria", "Ávila", "Palencia"],
  "Castilla-La Mancha": ["Toledo", "Ciudad Real", "Cuenca", "Guadalajara", "Albacete"],
  Canarias: ["Las Palmas", "Santa Cruz de Tenerife"],
  Aragón: ["Zaragoza", "Huesca", "Teruel"],
  Extremadura: ["Cáceres", "Badajoz"],
  Asturias: ["Oviedo", "Gijón"],
  Cantabria: ["Santander"],
  Navarra: ["Pamplona"],
  "La Rioja": ["Logroño"],
  Murcia: ["Murcia"],
  "País Vasco": ["Vizcaya", "Guipúzcoa", "Álava"],
  Baleares: ["Palma de Mallorca", "Ibiza", "Menorca"],
  Ceuta: ["Ceuta"],
  Melilla: ["Melilla"],
};

export default function ConservationPage() {
  const [form, setForm] = useState({
    titulo: "",
    tipoRecurso: "",
    cantidadArboles: "",
    coords: "",
    comunidadAutonoma: "",
    provincia: "",
    direccion: "",
    tipoPropiedad: "",
    titular: "",
    superficieM2: "",
    volumenMadera: "0",
    codigoCatastral: "",
    estadoLegal: "",
    figuraProteccion: "",
    fechaInicioConservacion: "",
    autoridadValidante: "",
    especiesPresentes: "",
    observaciones: "",
    puntosPoligono: "",
  });

  const [planManejo, setPlanManejo] = useState<File | null>(null);
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [planos, setPlanos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setState: Function, multiple = false) => {
    const files = e.target.files;
    if (!files) return;
    if (multiple) setState(Array.from(files));
    else setState(files[0]);
  };
  //handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1️⃣ Validaciones básicas (las que ya tienes)
  if (!form.titulo || !form.tipoRecurso || !form.coords) {
    alert("❌ Faltan campos obligatorios.");
    return;
  }

  try {
    setLoading(true);

    // 2️⃣ Armar FormData para enviar al middleware
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(form));

    if (planManejo) formData.append("files", planManejo);
    documentos.forEach((d) => formData.append("files", d));
    imagenes.forEach((i) => formData.append("files", i));
    planos.forEach((p) => formData.append("files", p));

    // 3️⃣ POST al middleware
    const res = await fetch("http://localhost:4000/api/conservation", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Error en middleware");

    const cid = data.IpfsHash;
    console.log("📦 Metadata subida a IPFS:", cid);

    // 4️⃣ Conectar a contrato Plantarum721
    if (!(window as any).ethereum) throw new Error("❌ Instala MetaMask");
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      addresses.Plantarum721,
      Plantarum721ABI,
      signer
    );

    // 5️⃣ Preparar parámetros
    const userAddress = await signer.getAddress();
    const hashId = crypto.randomUUID(); // hash único
    const coords = form.coords;
    const tokenURI = `ipfs://${cid}`;

    // 6️⃣ Mintear NFT de Conservación
    const tx = await contract.mintConservation(userAddress, hashId, coords, tokenURI);
    const receipt = await tx.wait();

    setTxHash(receipt.hash);
    alert("✅ Conservación tokenizada correctamente.");
  } catch (err: any) {
    console.error(err);
    alert("❌ Error en tokenización: " + err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        🌳 Tokenización: Conservación
      </h2>

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Título */}
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            type="text"
            placeholder="Nombre del Proyecto de Conservación"
            className="input-dark"
            style={{ color: "#fff" }}
            required
          />

          {/* Tipo de Recurso */}
          <select
            name="tipoRecurso"
            value={form.tipoRecurso}
            onChange={handleChange}
            className="input-dark"
            style={{ color: "#fff" }}
            required
          >
            <option value="">Selecciona el tipo de Recurso a Proteger</option>
            <option value="arbol">Árbol individual</option>
            <option value="grupo">Grupo de árboles</option>
            <option value="bosque">Bosque</option>
          </select>

          {/* Cantidad Árboles */}
          {form.tipoRecurso === "grupo" && (
            <input
              name="cantidadArboles"
              value={form.cantidadArboles}
              onChange={handleChange}
              type="number"
              placeholder="Cantidad de Árboles"
              className="input-dark"
              style={{ color: "#fff" }}
            />
          )}

          {/* Coordenadas */}
          <input
            name="coords"
            value={form.coords}
            onChange={handleChange}
            type="text"
            placeholder="Coordenadas (lat,lng. Ej: 10.123,-67.987)"
            className="input-dark"
            style={{ color: "#fff" }}
            required
          />

          {/* Puntos Geográficos */}
          {form.tipoRecurso === "bosque" && (
            <textarea
              name="puntosPoligono"
              value={form.puntosPoligono}
              onChange={handleChange}
              placeholder="Introduce los puntos del polígono (lat,lng separados por comas)"
              className="input-dark"
              style={{ color: "#fff", minHeight: "80px" }}
            />
          )}

          {/* Especies */}
          <textarea
            name="especiesPresentes"
            value={form.especiesPresentes}
            onChange={handleChange}
            placeholder="Especies presentes (separadas por comas)"
            className="input-dark"
            style={{ color: "#fff", minHeight: "80px" }}
          />

          {/* Comunidad Autónoma */}
          <select
            name="comunidadAutonoma"
            value={form.comunidadAutonoma}
            onChange={handleChange}
            className="input-dark"
            style={{ color: "#fff" }}
          >
            <option value="">Selecciona Comunidad Autónoma</option>
            {Object.keys(comunidades).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Provincia */}
          {form.comunidadAutonoma && (
            <select
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              className="input-dark"
              style={{ color: "#fff" }}
            >
              <option value="">Selecciona Provincia/Municipio</option>
              {(comunidades[form.comunidadAutonoma] || []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {/* Dirección */}
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            type="text"
            placeholder="Municipio, ciudad, pueblo, calle o camino"
            className="input-dark"
            style={{ color: "#fff" }}
          />

          {/* Tipo Propiedad */}
          <select
            name="tipoPropiedad"
            value={form.tipoPropiedad}
            onChange={handleChange}
            className="input-dark"
            style={{ color: "#fff" }}
          >
            <option value="">Selecciona Tipo de Propiedad</option>
            <option>Pública</option>
            <option>Privada</option>
          </select>

          {/* Titular + Documentos + Código Catastral → solo si es Privada */}
          {form.tipoPropiedad === "Privada" && (
            <>
              <input
                name="titular"
                value={form.titular}
                onChange={handleChange}
                type="text"
                placeholder="Titular de la Propiedad"
                className="input-dark"
                style={{ color: "#fff" }}
              />
              <div className="input-dark" style={{ padding: "12px" }}>
                <label>📑 Documentos de Propiedad (PDF máx 1MB)</label>
                <input type="file" accept=".pdf" multiple onChange={(e) => handleFileChange(e, setDocumentos, true)} />
              </div>
              <input
                name="codigoCatastral"
                value={form.codigoCatastral}
                onChange={handleChange}
                type="text"
                placeholder="Código Catastral"
                className="input-dark"
                style={{ color: "#fff" }}
              />
            </>
          )}

          {/* Autoridad que Rige → solo si es Pública */}
          {form.tipoPropiedad === "Pública" && (
            <input
              name="autoridadValidante"
              value={form.autoridadValidante}
              onChange={handleChange}
              type="text"
              placeholder="Autoridad que Rige"
              className="input-dark"
              style={{ color: "#fff" }}
            />
          )}

          {/* Estado Legal */}
          <select name="estadoLegal" value={form.estadoLegal} onChange={handleChange} className="input-dark" style={{ color: "#fff" }}>
            <option value="">Selecciona Estado Legal</option>
            <option>Protegido</option>
            <option>En conservación</option>
            <option>En recuperación</option>
          </select>

          {/* Figura Protección */}
          <select name="figuraProteccion" value={form.figuraProteccion} onChange={handleChange} className="input-dark" style={{ color: "#fff" }}>
            <option value="">Selecciona Figura de Protección</option>
            <option>Comunitaria</option>
            <option>Nacional</option>
            <option>Autonómica</option>
            <option>Municipal</option>
            <option>Privada</option>
          </select>

          {/* Fecha */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", color: "#bbf7d0" }}>
              📅 Inicio del Proyecto de Conservación
            </label>
            <input
              name="fechaInicioConservacion"
              value={form.fechaInicioConservacion}
              onChange={handleChange}
              type="date"
              className="input-dark"
              style={{ color: "#fff" }}
            />
          </div>

          {/* Plan Manejo */}
          <div
              className="input-dark"
              style={{
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
              onClick={() => document.getElementById("planManejo")?.click()}
            >
              <span>📑 Plan de Conservación (PDF máx 1MB)</span>
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>
               {planManejo ? planManejo.name : "Ningún archivo seleccionado"}
              </span>
              <input
              id="planManejo"
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setPlanManejo)}
              style={{ display: "none" }}
            />
          </div>

          {/* Imágenes */}
          <div
  className="input-dark"
  style={{
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  }}
  onClick={() => document.getElementById("imagenes")?.click()}
>
  <span>🖼️ Imágenes (PNG/JPG máx 2MB, máx 3 archivos)</span>
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

          {/* Planos */}
          <div
  className="input-dark"
  style={{
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  }}
  onClick={() => document.getElementById("planos")?.click()}
>
  <span>📑 Planos/Mapas (PDF máx 1MB, máx 5 archivos)</span>
  <span style={{ color: "#9ca3af", fontSize: "12px" }}>
    {planos.length > 0
      ? `${planos.length} archivo(s) seleccionado(s)`
      : "Ningún archivo seleccionado"}
  </span>
  <input
    id="planos"
    type="file"
    accept=".pdf"
    multiple
    onChange={(e) => handleFileChange(e, setPlanos, true)}
    style={{ display: "none" }}
  />
</div>

          {/* Observaciones */}
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Observaciones (máx 50 palabras)"
            className="input-dark"
            style={{ color: "#fff", minHeight: "60px" }}
          />

          <button type="submit" className="btn-green w-full" style={{ marginTop: "20px" }}>
            🚀 Tokenizar Conservación (Paso 1)
          </button>
        </form>
      {/* Feedback dinámico */}
        {loading && <p className="text-yellow-400 mt-4 text-center">⏳ Procesando...</p>}

        {txHash && (
          <p className="text-green-400 mt-4 text-center">
            ✅ NFT minteado. TX Hash:{" "}
            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="underline">
              {txHash}
            </a>
          </p>
        )}
      </div>
      {/* Botón volver al Tesoro */}
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




