import { redis } from "../db/redis.js";

const INVITE_TTL = 24 * 60 * 60; // 24 hours

export async function cacheInvite(
  inviteCode: string,
  roomId: string,
  hostName: string
) {
  await redis.set(
    `invite:${inviteCode}`,
    JSON.stringify({ roomId, hostName }),
    "EX",
    INVITE_TTL
  );
}

export async function lookupInvite(
  inviteCode: string
): Promise<{ roomId: string; hostName: string } | null> {
  const data = await redis.get(`invite:${inviteCode}`);
  if (!data) return null;
  return JSON.parse(data);
}
