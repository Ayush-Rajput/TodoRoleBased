import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "development-secret-change-me",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production"
};
