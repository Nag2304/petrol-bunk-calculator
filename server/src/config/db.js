import dns from "node:dns";
import pg from "pg";
import { env } from "./env.js";

const { Pool, types } = pg;
types.setTypeParser(1082, (value) => value);

const isHostedDatabase =
  !env.DATABASE_URL.includes("localhost") &&
  !env.DATABASE_URL.includes("127.0.0.1");

// Prefer IPv4 for hosted Postgres providers because some deploy targets
// advertise IPv6 records that are not reachable from the runtime network.
dns.setDefaultResultOrder("ipv4first");

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  family: isHostedDatabase ? 4 : undefined,
  ssl: isHostedDatabase ? { rejectUnauthorized: false } : false
});

export default pool;
