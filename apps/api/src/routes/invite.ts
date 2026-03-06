import type { FastifyInstance } from "fastify";
import { lookupInvite } from "../services/invites.js";
import { getRoomByInviteCode } from "../services/rooms.js";

export async function inviteRoutes(app: FastifyInstance) {
  app.get<{ Params: { code: string } }>(
    "/invite/:code",
    async (request, reply) => {
      const { code } = request.params;

      // Fast path: Redis
      const cached = await lookupInvite(code);
      if (cached) {
        return cached;
      }

      // Fallback: DB
      const room = await getRoomByInviteCode(code);
      if (!room || !room.isActive) {
        return reply.status(404).send({ error: "Invite not found or expired" });
      }

      return { roomId: room.id, hostName: room.hostName };
    }
  );
}
