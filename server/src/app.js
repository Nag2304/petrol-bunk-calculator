import cors from "cors";
import express from "express";
import helmet from "helmet";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import { env } from "./config/env.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "..", "..", "client", "dist");

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [env.CLIENT_ORIGIN];
      const isLocalhost =
        /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
      let isRenderDomain = false;

      try {
        const hostname = new URL(origin).hostname;
        isRenderDomain = hostname.endsWith(".onrender.com");
      } catch {
        isRenderDomain = false;
      }

      if (allowedOrigins.includes(origin) || isLocalhost || isRenderDomain) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    }
  })
);
app.use(express.json());

function renderApiPage(_request, response) {
  response
    .status(200)
    .send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Petrol Bunk Calculator API</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              font-family: system-ui, sans-serif;
              background: #f5f4ef;
              color: #15201d;
            }
            main {
              width: min(640px, calc(100% - 32px));
              padding: 28px;
              border: 1px solid #d5ddd9;
              border-radius: 12px;
              background: white;
              box-shadow: 0 24px 60px rgba(28, 47, 41, 0.12);
            }
            a {
              color: #0f7b5f;
              font-weight: 800;
              text-decoration: none;
            }
            code {
              padding: 2px 6px;
              border-radius: 6px;
              background: #edf6f2;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Petrol Bunk Calculator API</h1>
            <p>This is the backend server.</p>
            <p>Open the React app here: <a href="http://localhost:5174">http://localhost:5174</a></p>
            <p>Health check: <code>/api/health</code></p>
          </main>
        </body>
      </html>
    `);
}

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else {
  app.get("/", renderApiPage);
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", recordRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use((request, response, next) => {
    if (request.path.startsWith("/api")) {
      return next();
    }

    response.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Unexpected server error" });
});

export default app;
