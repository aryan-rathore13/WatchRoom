import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { roomRoutes } from "./routes/rooms.js";
import { inviteRoutes } from "./routes/invite.js";
import { tokenRoutes } from "./routes/tokens.js";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  });

  await app.register(roomRoutes);
  await app.register(inviteRoutes);
  await app.register(tokenRoutes);

  app.get("/health", async () => ({ status: "ok" }));

  const PORT = parseInt(process.env.PORT || "3001", 10);

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`API server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
