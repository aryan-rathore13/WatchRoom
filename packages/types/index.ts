export interface Room {
  id: string;
  inviteCode: string;
  livekitRoom: string;
  hostName: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface CreateRoomRequest {
  hostName: string;
}

export interface CreateRoomResponse {
  roomId: string;
  inviteCode: string;
  token: string;
  livekitUrl: string;
}

export interface InviteResponse {
  roomId: string;
  hostName: string;
}

export interface TokenRequest {
  roomId: string;
  participantName: string;
  role: "host" | "viewer";
}

export interface TokenResponse {
  token: string;
  livekitUrl: string;
}

export interface ChatMessage {
  type: "chat";
  name: string;
  text: string;
  ts: number;
}
