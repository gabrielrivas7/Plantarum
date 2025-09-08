//src/app/token/forest/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Definimos la estructura de metadata que viene del middleware/IPFS
interface ForestAsset {
  id: string;
  titulo: string;
  especiePrincipal: string;
  superficieM2: string;
  superficieHa: string;
  coords: string;
  puntosPoligono: string;
  tipoActivo: string;
  precioUnitario: string;
  precioVenta: string;
  precioBaseSubasta: string;
  tiempoSubasta: string;
  transaccion: string; // venta | subasta
  moneda: string;
  comunidadAutonoma: string;
  provincia: string;
  municipio: string;
  tipoPropiedad: string;
  titular: string;
  derechoPosesion: string;
  conTransporte: string;
  observaciones: string;
  imagenes: string[];
  documentos: string[];
  planos: string[];
}

export default function ForestAssetDetail() {
  const { id } = useParams(); // tokenId o hash
  const [asset, setAsset] = useState<ForestAsset | null>(null);

  useEffect(() => {
    // 🔹 Aquí deberías traer la metadata real desde IPFS o backend.
    // Por ahora simulamos con datos mock.
    const mock: ForestAsset = {
      id: id as string,
      titulo: "Lote de Madera de Tronco",
      especiePrincipal: "Pino Silvestre",
      superficieM2: "20000",
      superficieHa: "2",
      coords: "40.123,-3.456",
      puntosPoligono: "40.1,-3.4;40.2,-3.5;40.15,-3.45",
      tipoActivo: "lote_tronco",
      precioUnitario: "50",
      precioVenta: "10000",
      precioBaseSubasta: "5000",
      tiempoSubasta: "7",
      transaccion: "venta", // o "subasta"
      moneda: "ETH",
      comunidadAutonoma: "Madrid",
      provincia: "Madrid",
      municipio: "Alcobendas",
      tipoPropiedad: "Privada",
      titular: "Juan Pérez",
      derechoPosesion: "",
      conTransporte: "Sí",
      observaciones: "Lote certificado con normativa autonómica.",
      imagenes: [
        "https://via.placeholder.com/400x200.png?text=Imagen+1",
        "https://via.placeholder.com/400x200.png?text=Imagen+2",
      ],
      documentos: [],
      planos: [],
    };

    setAsset(mock);
  }, [id]);

  if (!asset) return <p className="text-center mt-10">⏳ Cargando activo...</p>;

  return (
    <main style={{ padding: "24px", minHeight: "80vh" }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        🌲 Activo Forestal: {asset.titulo}
      </h2>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Imagen principal */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Imagen</h3>
          <img
            src={asset.imagenes[0]}
            alt={asset.titulo}
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Tipo de activo */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Tipo de Activo</h3>
          <p>{asset.tipoActivo}</p>
        </div>

        {/* Especie */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Especie Principal</h3>
          <p>{asset.especiePrincipal}</p>
        </div>

        {/* Superficie */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Superficie</h3>
          <p>{asset.superficieM2} m² ({asset.superficieHa} ha)</p>
        </div>

        {/* Coordenadas */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Ubicación</h3>
          <p>
            {asset.comunidadAutonoma}, {asset.provincia}, {asset.municipio}
          </p>
          <p>Coords: {asset.coords}</p>
        </div>

        {/* Propiedad */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Propiedad</h3>
          <p>{asset.tipoPropiedad}</p>
          {asset.tipoPropiedad === "Privada" && <p>Titular: {asset.titular}</p>}
          {asset.tipoPropiedad === "Publica" && (
            <p>Derecho: {asset.derechoPosesion}</p>
          )}
        </div>

        {/* Transacción */}
        <div className="card-dark">
          <h3 className="text-lg font-bold mb-2 text-green-400">Transacción</h3>
          {asset.transaccion === "venta" ? (
            <>
              <p>
                💵 Precio: {asset.precioVenta} {asset.moneda}
              </p>
              <button className="btn-green mt-3 w-full">Comprar</button>
            </>
          ) : (
            <>
              <p>
                ⏱️ Subasta: base {asset.precioBaseSubasta} {asset.moneda} –{" "}
                {asset.tiempoSubasta} días
              </p>
              <button className="btn-green mt-3 w-full">Pujar</button>
            </>
          )}
        </div>

        {/* Observaciones */}
        <div className="card-dark col-span-1 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-bold mb-2 text-green-400">Observaciones</h3>
          <p>{asset.observaciones}</p>
        </div>
      </div>
    </main>
  );
}

          