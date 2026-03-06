"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInvite, getToken } from "@/lib/api";
import { LobbyView } from "@/components/lobby/LobbyView";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [roomId, setRoomId] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getInvite(inviteCode)
      .then((res) => {
        setRoomId(res.roomId);
        setHostName(res.hostName);
      })
      .catch(() => setError("Invite not found or expired."));
  }, [inviteCode]);

  const handleJoin = async (name: string) => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { token, livekitUrl } = await getToken({
        roomId,
        participantName: name,
        role: "viewer",
      });
      const searchParams = new URLSearchParams({
        token,
        livekitUrl,
        name,
        inviteCode,
      });
      router.push(`/room/${roomId}?${searchParams.toString()}`);
    } catch {
      setError("Failed to join room.");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="rounded-2xl border border-red-500/20 bg-slate-custom p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-400">Error</h2>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-sm text-slate-400">Loading invite...</div>
      </div>
    );
  }

  return (
    <LobbyView
      hostName={hostName || undefined}
      onJoin={handleJoin}
      loading={loading}
    />
  );
}
