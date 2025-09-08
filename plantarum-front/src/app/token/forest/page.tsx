//src/app/src/apptoken/forest/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import addresses from "@/utils/addresses_eth";
import Plantarum721ABI from "@/abi/Plantarum721.json";

// 📌 Comunidades Autónomas y Provincias
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

export default function ForestPage() {
  const [form, setForm] = useState({
    tipoActivo: "",
    origen: "",
    permisoFitosanitario: "",
    especiePrincipal: "",
    especiesOtras: "",
    especieSecundaria: "",
    valorM3: "",
    pesoKg: "",
    superficieM2: "",
    coords: "",
    puntosPoligono: "",
    tipoPropiedad: "",
    titular: "",
    derechoPosesion: "",
    comunidadAutonoma: "",
    provincia: "",
    municipio: "",
    usoPrevisto: "",
    transaccion: "", // venta | subasta
    moneda: "",
    precioUnitario: "",
    precioVenta: "",
    precioBaseSubasta: "",
    tiempoSubasta: "",
    observaciones: "",
    cumpleNormativaAutonoma: "",
    autoridadCompetente: "",
    conTransporte: "",
  });

  const [documentos, setDocumentos] = useState<File[]>([]);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [planos, setPlanos] = useState<File[]>([]);
  const [permisoExplotacion, setPermisoExplotacion] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(50);

  // 📝 Manejo de formularios
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
    else setState(files[0]);
  };

  // 📊 Contador de palabras en observaciones
  const handleObservaciones = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.trim().split(/\s+/);
    if (words.length <= 50) {
      setForm({ ...form, observaciones: e.target.value });
      setWordCount(50 - words.length);
    }
  };

  // 💶 Conversión a hectáreas
  const superficieHa = form.superficieM2
    ? (parseFloat(form.superficieM2) / 10000).toFixed(2)
    : "0";

  // 🚀 handleSubmit → Middleware + Contrato
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipoActivo || !form.coords) {
      alert("❌ Faltan campos obligatorios.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Metadata para middleware
      const formData = new FormData();
      formData.append("metadata", JSON.stringify(form));
      if (permisoExplotacion) formData.append("files", permisoExplotacion);
      documentos.forEach((d) => formData.append("files", d));
      imagenes.forEach((i) => formData.append("files", i));
      planos.forEach((p) => formData.append("files", p));

      const res = await fetch("http://localhost:4000/api/forest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error en middleware");

      const cid = data.IpfsHash;

      // 2️⃣ Conexión con contrato
      if (!(window as any).ethereum) throw new Error("❌ Instala MetaMask");
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.Plantarum721,
        Plantarum721ABI,
        signer
      );

      const userAddress = await signer.getAddress();
      const hashId = crypto.randomUUID();
      const tokenURI = `ipfs://${cid}`;
      const price = ethers.parseEther(form.precioVenta || "0");

      // 3️⃣ Mintear NFT ForestAsset
      const tx = await contract.mintForestAsset(
        userAddress,
        hashId,
        form.coords,
        tokenURI,
        price
      );
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      alert("✅ ForestAsset tokenizado correctamente.");
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
        🌲 Tokenización: Activos Forestales
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
          {/* Tipo de Activo */}
          <select
            name="tipoActivo"
            value={form.tipoActivo}
            onChange={handleChange}
            className="input-dark"
            required
          >
            <option value="">Selecciona Tipo de Activo</option>
            <option value="monte">Monte o Terreno Forestal</option>
            <option value="lote_maderables">Lote de Recursos Maderables</option>
            <option value="lote_no_maderables">Lote de Recursos No Maderables</option>
            <option value="lote_tronco">Lote de Madera de Tronco</option>
            <option value="lote_aserrada">Lote de Madera Aserrada</option>
            <option value="productos">Lote de Productos de Madera</option>
            <option value="biomasa">Biomasa para Energía</option>
            <option value="lena">Lote de Leña</option>
            <option value="residuos">Residuos</option>
          </select>
                {/* Origen */}
            <div>
              <label className="text-green-200">Origen</label>
              <div className="flex gap-6 mt-2">
                {["Nacional", "Comunitario", "Internacional"].map((opt) => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name="origen"
                      value={opt}
                      checked={form.origen === opt}
                      onChange={handleChange}
                      disabled={form.tipoActivo === "monte"} // bloqueado si es Monte
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            </div>
                  {/* Permiso Fitosanitario */}
            {form.origen && (
              <input
                name="permisoFitosanitario"
                value={form.permisoFitosanitario}
                onChange={handleChange}
                type="text"
                placeholder="Ingrese permiso Fitosanitario"
                className="input-dark"
              />
            )}

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

{/* Selección de Especie */}
<select
  name="especiePrincipal"
  value={form.especiePrincipal}
  onChange={handleChange}
  className="input-dark"
  required
>
  <option value="">Selecciona especie</option>
  <option value="Pinus sylvestris">Pinus sylvestris</option>
  <option value="Pinus pinaster">Pinus pinaster</option>
  <option value="Eucalyptus globulus">Eucalyptus globulus</option>
  <option value="Fagus sylvatica">Fagus sylvatica</option>
  <option value="Pinus halepensis">Pinus halepensis</option>
  <option value="Pinus nigra">Pinus nigra</option>
  <option value="Quercus ilex">Quercus ilex</option>
  <option value="Pinus radiata">Pinus radiata</option>
  <option value="Quercus pyrenaica">Quercus pyrenaica</option>
  <option value="Castanea sativa">Castanea sativa</option>
  <option value="Pinus pinea">Pinus pinea</option>
  <option value="Quercus suber">Quercus suber</option>
  <option value="Resto de especies">Resto de especies</option>
  <option value="Otras">Otras</option>
</select>

{/* Textarea si selecciona Otras */}
{form.especiePrincipal === "Otras" && (
  <textarea
    name="especiesOtras"
    value={form.especiesOtras || ""}
    onChange={handleChange}
    placeholder="Ingrese otras especies, separadas por comas"
    className="input-dark"
    style={{ minHeight: "80px" }}
  />
)}
          {/* Especies Secundarias */}
          <input
            name="especieSecundaria"
            value={form.especieSecundaria}
            onChange={handleChange}
            type="text"
            placeholder="Especies Secundarias (más especies separar por comas)"
            className="input-dark"
          />

          {/* Volumen estimado */}
          <input
            name="valorM3"
            value={form.valorM3}
            onChange={handleChange}
            type="number"
            step="0.01"
            min="1" // 👈 asegura que nunca sea menor a 1
            placeholder="Volumen estimado (m³)"
            className="input-dark"
          />

          {/* Peso estimado */}
          <input
            name="pesoKg"
            value={form.pesoKg}
            onChange={handleChange}
            type="number"
            step="0.1"
            min="1" // 👈 asegura que nunca sea menor a 1
            placeholder="Peso Estimado (kg)"
            className="input-dark"
          />


{/* Con Transporte */}
{form.tipoActivo && form.tipoActivo !== "monte" && (
  <div>
    <label className="text-green-200">¿Con Transporte?</label>
    <div className="flex gap-4 mt-2">
      <label>
        <input
          type="radio"
          name="conTransporte"
          value="Si"
          checked={form.conTransporte === "Si"}
          onChange={handleChange}
        />{" "}
        Sí
      </label>
      <label>
        <input
          type="radio"
          name="conTransporte"
          value="No"
          checked={form.conTransporte === "No"}
          onChange={handleChange}
        />{" "}
        No
      </label>
    </div>
  </div>
)}

            
          {/* Superficie en m² */}
<input
  name="superficieM2"
  value={form.superficieM2}
  onChange={handleChange}
  type="number"
  placeholder="Superficie en m²"
  className="input-dark"
  disabled={form.tipoActivo !== "monte"} // 
/>
{form.superficieM2 && (
  <p className="text-sm text-gray-300">
    Equivalente: {superficieHa} ha
  </p>
)}

          
            {/* CCAA → Provincia → Municipio */}
          <select
            name="comunidadAutonoma"
            value={form.comunidadAutonoma}
            onChange={handleChange}
            className="input-dark"
          >
            <option value="">Selecciona Comunidad Autónoma</option>
            {Object.keys(comunidades).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {form.comunidadAutonoma && (
            <select
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              className="input-dark"
            >
              <option value="">Selecciona Provincia</option>
              {comunidades[form.comunidadAutonoma].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
          {form.provincia && (
            <input
              name="municipio"
              value={form.municipio}
              onChange={handleChange}
              type="text"
              placeholder="Municipio / Ciudad / Pueblo"
              className="input-dark"
            />
          )}
          
          {/* Coordenadas */}
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
            name="puntosPoligono"
            value={form.puntosPoligono}
            onChange={handleChange}
            placeholder="Introduce puntos del polígono (lat,lng separados por comas)"
            className="input-dark"
            disabled={form.tipoActivo !== "monte"} 
            style={{ minHeight: "80px" }}
          />

          {/* Propiedad privada */}
          <div>
            <label className="text-green-200">¿Propiedad Privada?</label>
            <div className="flex gap-4 mt-2">
              <label>
                <input
                  type="radio"
                  name="tipoPropiedad"
                  value="Privada"
                  checked={form.tipoPropiedad === "Privada"}
                  onChange={handleChange}
                />{" "}
                Sí
              </label>
              <label>
                <input
                  type="radio"
                  name="tipoPropiedad"
                  value="Publica"
                  checked={form.tipoPropiedad === "Publica"}
                  onChange={handleChange}
                />{" "}
                No
              </label>
            </div>
          </div>

          {form.tipoPropiedad === "Publica" && (
            <input
              name="derechoPosesion"
              value={form.derechoPosesion}
              onChange={handleChange}
              type="text"
              placeholder="Especifique el derecho que posee (máx 25 palabras)"
              className="input-dark"
            />
          )}

          {form.tipoPropiedad === "Privada" && (
            <>
              <input
                name="titular"
                value={form.titular}
                onChange={handleChange}
                type="text"
                placeholder="Titular de la Propiedad"
                className="input-dark"
              />
              <div
                className="input-dark"
                style={{ padding: "12px", cursor: "pointer" }}
                onClick={() => document.getElementById("documentosPropiedad")?.click()}
              >
                <span>📑 Documentos de Propiedad (PDF máx 1MB)</span>
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                  {documentos.length > 0
                    ? `${documentos.length} archivo(s) seleccionado(s)`
                    : "Ningún archivo seleccionado"}
                </span>
                <input
                  id="documentosPropiedad"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => handleFileChange(e, setDocumentos, true)}
                  style={{ display: "none" }}
                />
              </div>
            </>
          )}

          {/* Uso previsto */}
          <select
            name="usoPrevisto"
            value={form.usoPrevisto}
            onChange={handleChange}
            className="input-dark"
          >
            <option value="">Uso previsto</option>
            <option value="madera">Madera</option>
            <option value="biocombustible">Biocombustible</option>
            <option value="resina">Resina</option>
            <option value="aserrio">Aserrío</option>
            <option value="transformacion">Transformación en productos de Madera</option>
            <option value="otro">Otro</option>
          </select>

          {/* Venta/Subasta */}
          <div>
            <label className="text-green-200">Tipo de Transacción</label>
            <div className="flex gap-6 mt-2">
              <label>
                <input
                  type="radio"
                  name="transaccion"
                  value="venta"
                  checked={form.transaccion === "venta"}
                  onChange={handleChange}
                />{" "}
                Venta
              </label>
              <label>
                <input
                  type="radio"
                  name="transaccion"
                  value="subasta"
                  checked={form.transaccion === "subasta"}
                  onChange={handleChange}
                />{" "}
                Subasta
              </label>
            </div>
          </div>

          {/* Venta con Precio Unitario */}
          {form.transaccion === "venta" && (
            <>
              <select
                name="moneda"
                value={form.moneda}
                onChange={handleChange}
                className="input-dark"
              >
                <option value="">Selecciona moneda</option>
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="PLNTX">PLNTX</option>
              </select>
              <input
                name="precioUnitario"
                value={form.precioUnitario}
                onChange={handleChange}
                type="number"
                step="0.01"
                placeholder="💲 Precio Unitario"
                className="input-dark"
              />
              <input
                name="precioVenta"
                value={form.precioVenta}
                onChange={handleChange}
                type="number"
                step="0.01"
                placeholder="💰 Precio Venta"
                className="input-dark"
              />
            </>
          )}

          {form.transaccion === "subasta" && (
            <>
              <select
                name="moneda"
                value={form.moneda}
                onChange={handleChange}
                className="input-dark"
              >
                <option value="">Selecciona moneda</option>
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="PLNTX">PLNTX</option>
              </select>
              <input
                name="precioBaseSubasta"
                value={form.precioBaseSubasta}
                onChange={handleChange}
                type="number"
                step="0.01"
                placeholder="💰 Precio Base Subasta"
                className="input-dark"
              />
              <select
                name="tiempoSubasta"
                value={form.tiempoSubasta}
                onChange={handleChange}
                className="input-dark"
              >
                <option value="">Duración de Subasta</option>
                <option value="1">1 día</option>
                <option value="3">3 días</option>
                <option value="7">7 días</option>
                <option value="14">14 días</option>
                <option value="21">21 días</option>
              </select>
            </>
          )}

          {/* Informe Descriptivo, Oferta y Documentos */}
          <div
            className="input-dark"
            style={{
              padding: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("informeDocs")?.click()}
          >
            <span>📑 Soportes Documentales (PDF máx 3, 2MB c/u)</span>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
              {documentos.length > 0
                ? `${documentos.length} archivo(s) seleccionado(s)`
                : "Agregar informe Descriptivo, Oferta y documentos de propiedad o facturas"}
            </span>
            <input
              id="informeDocs"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => handleFileChange(e, setDocumentos, true)}
              style={{ display: "none" }}
            />
          </div>


          {/* Observaciones */}
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleObservaciones}
            placeholder="Observaciones (máx 50 palabras)"
            className="input-dark"
            style={{ minHeight: "60px" }}
          />
          <p className="text-sm text-gray-300">Palabras restantes: {wordCount}</p>

          <button type="submit" className="btn-green w-full mt-4">
            🚀 Tokenizar ForestAsset
          </button>
        </form>
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



