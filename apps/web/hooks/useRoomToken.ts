"use client";

import { useState, useCallback } from "react";
import { getToken } from "@/lib/api";

export function useRoomToken() {
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(
    async (
      roomId: string,
      participantName: string,
      role: "host" | "viewer"
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getToken({ roomId, participantName, role });
        setToken(res.token);
        setLivekitUrl(res.livekitUrl);
        return res;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get token");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { token, livekitUrl, loading, error, fetchToken };
}
