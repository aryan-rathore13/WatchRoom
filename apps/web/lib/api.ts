import type {
  CreateRoomRequest,
  CreateRoomResponse,
  InviteResponse,
  TokenRequest,
  TokenResponse,
} from "@watchroom/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function createRoom(data: CreateRoomRequest) {
  return fetcher<CreateRoomResponse>("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getInvite(code: string) {
  return fetcher<InviteResponse>(`/invite/${code}`);
}

export function getToken(data: TokenRequest) {
  return fetcher<TokenResponse>("/tokens", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
