import type { FastifyInstance } from "fastify";
import { getRoomById } from "../services/rooms.js";
import { generateToken, getLivekitUrl } from "../services/livekit.js";

export async function tokenRoutes(app: FastifyInstance) {
  app.post<{
    Body: { roomId: string; participantName: string; role: "host" | "viewer" };
  }>("/tokens", async (request, reply) => {
    const { roomId, participantName, role } = request.body;

    if (!roomId || !participantName || !role) {
      return reply
        .status(400)
        .send({ error: "roomId, participantName, and role are required" });
    }

    if (role !== "host" && role !== "viewer") {
      return reply
        .status(400)
        .send({ error: 'role must be "host" or "viewer"' });
    }

    const room = await getRoomById(roomId);
    if (!room || !room.isActive) {
      return reply.status(404).send({ error: "Room not found or inactive" });
    }

    const token = await generateToken(
      room.livekitRoom,
      participantName.trim(),
      role
    );

    return { token, livekitUrl: getLivekitUrl() };
  });
}
