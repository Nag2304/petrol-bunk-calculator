import pg from "pg";
import { env } from "./env.js";

const { Pool, types } = pg;
types.setTypeParser(1082, (value) => value);

const isHostedDatabase =
  !env.DATABASE_URL.includes("localhost") &&
  !env.DATABASE_URL.includes("127.0.0.1");

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isHostedDatabase ? { rejectUnauthorized: false } : false
});

export default pool;
