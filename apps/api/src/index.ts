import express, { Request, Response } from "express";
import cors from "cors";
import env from "./config/env.js";

import connectDB from "./config/mongoose.js";
import { initializeCronJobs } from "./jobs/init-cron.js";
import apiRouter from "./routes/index.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.js";

const app = express();

const allowedOrigins = env.allowed_origins?.split(",") ?? [
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

if (env.env !== "test") {
  initializeCronJobs();
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: env.env, port: env.port });
});

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Kindora API running → http://localhost:${env.port}/api/v1`);
});
