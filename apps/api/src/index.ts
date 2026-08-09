import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load .env from repo root (works both locally and in CI)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import connectDB from "./config/mongoose";
import { initializeCronJobs } from "./services/init-cron";
import apiRouter from "./routes";
import { globalErrorHandler, notFoundHandler } from "./middleware/error";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB().catch(console.error);

if (process.env.NODE_ENV !== "test") {
  initializeCronJobs();
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, port: PORT });
});

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Kindora API running → http://localhost:${PORT}/api/v1`);
});
