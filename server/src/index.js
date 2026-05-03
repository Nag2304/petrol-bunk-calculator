import app from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./config/migrate.js";

async function start() {
  await runMigrations();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
