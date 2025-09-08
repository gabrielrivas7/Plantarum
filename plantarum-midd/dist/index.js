//src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import daoRoutes from "./routes/daoEvents.js";
import ipfsRoutes from "./routes/ipfs.js";
import tokenRoutes from "./routes/token.js";
import conservationRoutes from "./routes/conservation.js";
import forestRoutes from "./routes/forest.js";
import carbonRoutes from "./routes/carbon.js";
import projectsRoutes from "./routes/projects.js";
import rgpdRoutes from "./routes/rgpd.js";
import reputationRoutes from "./routes/reputation.js";
import kycRoutes from "./routes/kyc.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// 🔹 Endpoint de salud
app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "plantarum-midd",
        ts: Date.now(),
    });
});
// Rutas
app.use("/dao", daoRoutes);
app.use("/ipfs", ipfsRoutes);
app.use("/token", tokenRoutes);
app.use("/api/conservation", conservationRoutes);
app.use("/api/forest", forestRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/rgpd", rgpdRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/kyc", kycRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Middleware corriendo en http://localhost:${PORT}`);
});
