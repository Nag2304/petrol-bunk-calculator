import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const sqlPath = path.join(__dirname, "..", "sql", "001_init.sql");
  const sql = await fs.readFile(sqlPath, "utf8");
  await pool.query(sql);
  console.log("Database migration complete.");
  await pool.end();
}

migrate().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await pool.end();
  process.exit(1);
});
