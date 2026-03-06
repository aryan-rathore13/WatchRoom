import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "devsecret";
const LIVEKIT_URL = process.env.LIVEKIT_URL || "ws://localhost:7880";

const livekitHost = LIVEKIT_URL.replace("ws://", "http://").replace(
  "wss://",
  "https://"
);

export const roomService = new RoomServiceClient(
  livekitHost,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);

export async function createLivekitRoom(roomName: string) {
  return roomService.createRoom({
    name: roomName,
    emptyTimeout: 24 * 60 * 60,
    maxParticipants: 50,
  });
}

export async function generateToken(
  roomName: string,
  identity: string,
  role: "host" | "viewer"
) {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
  });

  if (role === "host") {
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
  } else {
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canPublishSources: ["microphone"],
      canSubscribe: true,
    });
  }

  return at.toJwt();
}

export function getLivekitUrl() {
  return LIVEKIT_URL;
}
