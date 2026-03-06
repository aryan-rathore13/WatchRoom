import { nanoid } from "nanoid";
import { prisma } from "../db/prisma.js";
import { createLivekitRoom, generateToken, getLivekitUrl } from "./livekit.js";
import { cacheInvite } from "./invites.js";

export async function createRoom(hostName: string) {
  const inviteCode = nanoid(8);
  const livekitRoomName = `room_${nanoid(12)}`;

  await createLivekitRoom(livekitRoomName);

  const room = await prisma.room.create({
    data: {
      inviteCode,
      livekitRoom: livekitRoomName,
      hostName,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await cacheInvite(inviteCode, room.id, hostName);

  const token = await generateToken(livekitRoomName, hostName, "host");

  return {
    roomId: room.id,
    inviteCode: room.inviteCode,
    token,
    livekitUrl: getLivekitUrl(),
  };
}

export async function getRoomById(roomId: string) {
  return prisma.room.findUnique({ where: { id: roomId } });
}

export async function getRoomByInviteCode(inviteCode: string) {
  return prisma.room.findUnique({ where: { inviteCode } });
}
