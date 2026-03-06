import type { FastifyInstance } from "fastify";
import { createRoom, getRoomById } from "../services/rooms.js";

export async function roomRoutes(app: FastifyInstance) {
  app.post<{ Body: { hostName: string } }>("/rooms", async (request, reply) => {
    const { hostName } = request.body;
    if (!hostName || typeof hostName !== "string") {
      return reply.status(400).send({ error: "hostName is required" });
    }

    const result = await createRoom(hostName.trim());
    return reply.status(201).send(result);
  });

  app.get<{ Params: { id: string } }>(
    "/rooms/:id",
    async (request, reply) => {
      const room = await getRoomById(request.params.id);
      if (!room) {
        return reply.status(404).send({ error: "Room not found" });
      }
      return room;
    }
  );
}
