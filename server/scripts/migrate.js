import pool from "../src/config/db.js";
import { runMigrations } from "../src/config/migrate.js";

async function migrate() {
  await runMigrations();
  console.log("Database migration complete.");
  await pool.end();
}

migrate().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await pool.end();
  process.exit(1);
});
