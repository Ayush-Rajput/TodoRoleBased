import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "public");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", notFound);

if (config.isProduction) {
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
} else {
  app.use(notFound);
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
});
