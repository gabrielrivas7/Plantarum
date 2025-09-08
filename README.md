##Trabajo de Fin de Máster Universidad de Salamanca, España##

##Tokenización de Activos Forestales y Gestión Mediante Dao.##

🌲 Plantarum – Protocolos de Tokenización y DAO Federada

Plantarum organiza la gestión forestal en cuatro tipos de tokenización y una DAO federada basada en comités especializados, 
que aseguran gobernanza descentralizada y trazabilidad en cada dimensión del ecosistema.

## htttps://plantarum.xyz   

1️⃣ Tokenización de Conservación 🌱

Objetivo: Representar digitalmente desde un árbol, o grupo de arboles, hasta bosuqes y áreas naturales, protegidas.

Estandar: ERC-721 (NFT único).

Metadatos clave:

📌 Ubicación georreferenciada (coordenadas o polígonos).

📐 Superficie en m² / ha.

🌳 Especies protegidas y nivel de conservación.

📄 Documentación de respaldo (EIA, estudios legales).

Beneficios:

Garantía de intangibilidad del área protegida.

Reconocimiento como activo ambiental auditable.

Integración futura con bonos verdes y organismos internacionales.

2️⃣ Tokenización de Bosques y Árboles 🌲🌳

Objetivo: Digitalizar propiedad de árboles individuales o lotes de bosques.

Estandar: ERC-721 (únicos).

Metadatos clave:

📌 Coordenadas exactas.

📐 Superficie y densidad de plantación.

🌲 Especie y edad del árbol/bosque.

💰 Valor estimado en mercado.

Beneficios:

Facilita la comercialización de madera y biomasa con trazabilidad.

Conexión con programas de reforestación y compensación.

Inmutabilidad geográfica: imposible falsificar la ubicación del activo.

3️⃣ Tokenización de Créditos de Carbono 🌍

Objetivo: Emitir y comercializar créditos de carbono certificados.

Estandar: ERC-1155 (semi-fungibles).

Metadatos clave:

📊 Equivalencia en toneladas de CO₂ capturado.

📌 Coordenadas vinculadas al proyecto.

🔗 Certificación (Verra, Gold Standard u otras APIs externas).

⏳ Duración y validez del crédito.

Beneficios:

Integración en mercados internacionales de carbono.

Transparencia: cada crédito auditable en blockchain.

Aumenta la liquidez y genera un mercado secundario descentralizado.

4️⃣ Tokenización de Proyectos Explotación y/o Industrial Forestal 🏭

Objetivo: Representar instalaciones y proyectos de transformación forestal.

Estandar: ERC-1155.

Metadatos clave:

🏗️ Tipo de proyecto (aserradero, biomasa, industria de papel, etc.).

📌 Ubicación de la instalación y del lote de bosque asociado.

📄 Licencias y autorizaciones legales.

💰 Inversión y capacidad de producción.

Beneficios:

Tokenización de proyectos con valor económico real.

Permite la financiación descentralizada.

Mejora la trazabilidad de la cadena de suministro forestal.

🏛️ DAO Federada Basada en Comités

La DAO de Plantarum se organiza de manera federada: cada comité tiene autonomía temática, pero está integrado en la gobernanza global.

🔹 Comités especializados:

Conservación → Gestiona áreas protegidas y reservas naturales.

Créditos de Carbono → Supervisa emisión, certificación y validez de créditos.

Industria → Autoriza y valida proyectos industriales forestales.

Legal → Maneja aspectos normativos, disputas y validaciones jurídicas.

🔹 Características:

Cada comité es una sub-DAO especializada.

Pueden emitir propuestas internas, someterlas a votación y elevarlas al plenario DAO.

Los miembros de la DAO global pueden pertenecer a uno o varios comités.

Los votos de los comités tienen ponderación especial en decisiones estratégicas.

🔹 Beneficios de la DAO Federada:

Escalabilidad: se pueden añadir más comités a medida que crece la plataforma.

Eficiencia: cada comité maneja su dominio con expertos dedicados.

Transparencia: todas las decisiones quedan registradas on-chain.

Participación activa: fomenta la descentralización y representación equilibrada.

🌟 Valor Diferencial

Cuatro vías de tokenización → cubren todo el ciclo forestal: conservación, explotación, carbono e industria.

DAO Federada → modelo de gobernanza robusto, escalable y participativo.

Georreferencia obligatoria → todos los activos vinculados a coordenadas verificables.

Trazabilidad total → integridad garantizada con hashes y almacenamiento híbrido (on/off chain).

Potencial internacional → conexión con APIs de certificación y mercados globales.

---

# 🌳 Protocolos 

Plantarum es un ecosistema Web3 para la **tokenización, trazabilidad y gobernanza DAO de activos forestales**, construido sobre Ethereum/Arbitrum.
Su diseño se organiza en **5 protocolos nucleares**, cada uno modular, interoperable y preparado para la escalabilidad.

---

## 1️⃣ **Protocolo de Georreferencia Descentralizada 🗺️**

* **Objetivo:** Vincular cada activo forestal tokenizado con su ubicación geográfica, asegurando **inmutabilidad y trazabilidad espacial**.
* **Características clave:**

  * Registro **on-chain** de coordenadas (puntos, polígonos o áreas).
  * Representación directa en el **mapa Leaflet + OpenStreetMap**.
  * Cada token (bosque, árbol, crédito, industria) posee un identificador geográfico único.
  * Garantiza que **ningún activo pueda duplicar coordenadas** o ser falsificado.
  * Cumple funciones de **resolución de disputas** desde el contrato inteligente.
* **Innovación:**

  * **Inmutabilidad geográfica:** una vez registrada la ubicación, queda asociada al NFT para siempre.
  * **Trazabilidad ambiental:** se pueden auditar movimientos, usos y reservas vinculados a coordenadas.

---

## 2️⃣ **Protocolo de Tokenización 🌲**

* **Objetivo:** Representar en blockchain los activos forestales en 4 modalidades tokenizadas.

* **Tipos de Tokenización:**

  1. **Conservación** → Áreas protegidas, reservas naturales. (ERC-721)
  2. **Activos Forestales para su comercialización**  
  3. **Bosques y Árboles** → Activos forestales explotables o preservados. (ERC-721)
  4. **Créditos de Carbono** → Unidades fraccionadas y fungibles. (ERC-1155)
  5. **Proyectos Industriales** → Aserraderos, industrias, cadenas de transformación. (ERC-1155)

* **Metadatos comunes:**

  * Ubicación (lat/lon, polígonos).
  * Superficie en **m² y ha** (con equivalencia automática).
  * Precio (venta directa o subasta).
  * Hash de integridad (almacenado en IPFS con validación on-chain).

* **Beneficios:**

  * Activos forestales **únicos, trazables e intercambiables**.
  * Inclusión de atributos económicos, ecológicos y legales.
  * Preparación para **mercados secundarios y DeFi**.

---

## 3️⃣ **Protocolo de Trazabilidad e Inmutabilidad Geográfica 📌**

* **Objetivo:** Garantizar que todos los registros de Plantarum sean verificables y auditables.

* **Funciones:**

  * Registro on-chain del **hash IPFS** de cada metadata.
  * Prueba de integridad: cada activo tiene su **huella digital única (Keccak256)**.
  * Validación en tiempo real de:

    * **Ubicación** (no modificable).
    * **Datos ambientales y de superficie**.
    * **Archivos asociados (PDF, imágenes, informes)**.
  * **GDPR compliance** → posibilidad de borrar off-chain, dejando el hash on-chain huérfano.

* **Innovación:**

  * Plantarum ofrece **pruebas históricas de localización**: cada token conserva la referencia exacta de sus coordenadas.
  * Integración con sensores IoT (humedad, temperatura, RF, cámaras) para reforzar la trazabilidad ambiental.

---

## 4️⃣ **Protocolo de Prueba de Reserva Forestal 🌐**

* **Objetivo:** Verificar la existencia de los activos forestales tokenizados.

* **Funciones clave:**

  * Selección aleatoria de auditores forestales cuyas actividades de auditoría son recompenzadas
  * Tan el activo forestal como el auditor son seleccionados aleatoriamentes.
  * Validar el estado de conservación de los activos tokenizados para su protección ambiental
  * Emisión de una **recompensa al propietario/gestor** si se cumplen los criterios ambientales.
  * Escrow temporal en Tesorería para asegurar pagos justos.

* **Innovación:**

  * Incentiva la **conservación activa** mediante validaciones aleatorias.
  * Genera un **ciclo de reputación forestal** entre propietarios y la DAO.
  * Posible integración con programas de **bonos verdes internacionales**.

---

## 5️⃣ **Protocolo de Gobernanza DAO y Tesorería 🏛️💰**

* **Objetivo:** Administrar la toma de decisiones y los fondos de Plantarum de forma transparente.

* **Funciones clave:**

  * DAO con propuestas, votación y ejecución descentralizada.
  * Tesorería con depósitos/retiros en ETH y PLNTX.
  * **Multi-transferencias** para pagos masivos.
  * Escrow (reservas con fechas de liberación).
  * Emergency Stop + Sweep de tokens.
  * Comités temáticos: Conservación, Créditos, Industria, Legal.

* **Beneficios:**

  * **Democracia forestal digital:** cada miembro puede influir en decisiones estratégicas.
  * Tesorería auditable en tiempo real.
  * Módulos preparados para migrar a **multisig wallets** y DAOs de segunda capa.

---

# 📊 Esquema de Integración

```
Usuario → Frontend (Next.js) → Middleware (Node/Express) → IPFS + Ethereum
            ↑                                         ↓
   Georreferencia / Tokenización / DAO / Tesorería / Prueba de Reserva
```

---

# 🌟 Potencial Estratégico

* **Georreferencia descentralizada** → evita fraudes en la ubicación de activos.
* **4 modalidades de tokenización** → amplia cobertura: conservación, explotación, créditos, industria.
* **Prueba de Reserva Forestal** → incentiva la protección con recompensas.
* **DAO + Tesorería** → transparencia, democracia y gestión segura de fondos.
* **Trazabilidad total** → cada activo tiene historia ambiental verificable.
* **Integración futura:** IoT forestal + APIs internacionales (Verra, Gold Standard).
* Preparado para escalar hacia una **L2 propia (Arbitrum Orbit)**.


