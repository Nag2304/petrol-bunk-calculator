import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(request, response, next) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, env.JWT_SECRET);
    request.user = payload;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}
