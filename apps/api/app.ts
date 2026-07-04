import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ClientError } from "./exceptions/index.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.use("/api/auth", authRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } })
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.name, message: err.message },
    });
  }

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server" },
  });
});

export default app;
