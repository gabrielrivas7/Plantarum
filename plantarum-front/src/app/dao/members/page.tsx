// src/app/dao/members/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlantarumDao } from "../../../../hooks/usePlantarumDao";
import { usePlantarumToken } from "../../../../hooks/usePlantarumToken";
import { useWallet } from "../../../context/WalletContext";
import axios from "axios";

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

export default function MembersPage() {
  const { joinDAO } = usePlantarumDao();
  const { approve } = usePlantarumToken();
  const { account } = useWallet();

  const [alias, setAlias] = useState("");
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [personaType, setPersonaType] = useState("");
  const [memberType, setMemberType] = useState("");

  const [image, setImage] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [comunidad, setComunidad] = useState("");
  const [municipios, setMunicipios] = useState<string[]>([]);

  const handleComunidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setComunidad(selected);
    setMunicipios(comunidades[selected] || []);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ La imagen no puede superar los 5MB");
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:4000/ipfs/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImage(res.data.IpfsHash);
    } catch (err) {
      console.error("❌ Error subiendo imagen a IPFS:", err);
    }
  };

  const handleJoinDAO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setMessage("⚠️ Conecta tu wallet primero.");
      return;
    }
    if (!image) {
      setMessage("⚠️ Debes subir una imagen antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Aprobando gasto...");

      // 1️⃣ Aprobar tokens
      await approve("dao", "5"); // 5 PLNTX

      // 2️⃣ Ejecutar joinDAO
      setMessage("⏳ Procesando transacción...");
      const tx = await joinDAO(alias, personaType, memberType, image);
      setMessage("✅ Te has unido a la DAO correctamente. TX: " + tx);

      // 3️⃣ Resetear formulario tras éxito
      setAlias("");
      setDni("");
      setNombre("");
      setPersonaType("");
      setMemberType("");
      setImage("");
      setPreview(null);
      setComunidad("");
      setMunicipios([]);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error al unirse a la DAO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">📋 Formulario de la DAO</h2>

      {/* 🔹 Flecha de regreso a la página principal del módulo DAO */}
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dao" className="text-green-400 hover:text-green-300 flex items-center gap-2">
          ← Volver a la DAO
        </Link>
      </div>

      <div
        style={{
          backgroundColor: "#064e3b",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1100px",
          minHeight: "500px",
          margin: "0 auto",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
        }}
      >
        <h3 className="text-green-300 mb-6 text-center">Formulario de Ingreso</h3>

        <form onSubmit={handleJoinDAO} className="flex flex-col gap-5" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" placeholder="Nombre / Apellido o Institución" className="input-dark" style={{ color: "#fff" }} />
          <input value={dni} onChange={(e) => setDni(e.target.value)} type="text" placeholder="DNI / NIE" className="input-dark" style={{ color: "#fff" }} />
          <input value={alias} onChange={(e) => setAlias(e.target.value)} type="text" placeholder="Alias / Username" className="input-dark" style={{ color: "#fff" }} />

          {/* Imagen */}
          <div style={{ textAlign: "center" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#bbf7d0" }}>
              Imagen de Perfil (máx 5MB)
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="input-dark" style={{ color: "#fff" }} />
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: "100px", height: "100px", borderRadius: "50%", border: "2px solid #22c55e" }} />
              ) : (
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#064e3b", border: "2px dashed #22c55e", display: "flex", justifyContent: "center", alignItems: "center", color: "#22c55e" }}>
                  Avatar
                </div>
              )}
            </div>
          </div>

          {/* Selectores */}
          <select value={personaType} onChange={(e) => setPersonaType(e.target.value)} className="input-dark" style={{ color: "#fff" }}>
            <option value="">Selecciona Tipo de Persona</option>
            <option>Persona Física</option>
            <option>Institución Pública</option>
            <option>Institución Privada</option>
            <option>Empresa Privada</option>
            <option>Cooperativa</option>
            <option>Sociedad Financiera</option>
            <option>Organización Conservacionista</option>
          </select>

          <select value={memberType} onChange={(e) => setMemberType(e.target.value)} className="input-dark" style={{ color: "#fff" }}>
            <option value="">Selecciona Tipo de Miembro</option>
            <option>Propietario Forestal</option>
            <option>Empresa Forestal</option>
            <option>Empresa de Bienes y Servicios</option>
            <option>Industria Forestal</option>
            <option>Institución Reguladora</option>
            <option>Inversor</option>
            <option>Experto Forestal</option>
            <option>Comunidad / Cooperativa</option>
          </select>

          <select className="input-dark" style={{ color: "#fff" }} onChange={handleComunidadChange}>
            <option value="">Selecciona Comunidad Autónoma</option>
            {Object.keys(comunidades).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select className="input-dark" style={{ color: "#fff" }} disabled={!comunidad}>
            <option value="">{comunidad ? "Selecciona Provincia/Municipio" : "Primero elige una Comunidad Autónoma"}</option>
            {municipios.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <input type="text" placeholder="Localidad / Pueblo / Ciudad" className="input-dark" style={{ color: "#fff" }} />

          <button type="submit" className="btn-green w-full" style={{ marginTop: "20px" }} disabled={loading}>
            {loading ? "⏳ Procesando..." : "🌱 Unirse a la DAO (5 PLNTX)"}
          </button>
        </form>

        {message && <p className="text-center text-green-300 mt-4">{message}</p>}
      </div>
    </main>
  );
}
