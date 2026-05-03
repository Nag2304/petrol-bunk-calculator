import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters long"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required")
});

export const env = schema.parse(process.env);
