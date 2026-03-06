"use client";

import { useSearchParams } from "next/navigation";
import { RoomView } from "@/components/room/RoomView";

export default function RoomPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const livekitUrl = searchParams.get("livekitUrl");
  const name = searchParams.get("name");

  if (!token || !livekitUrl || !name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="rounded-2xl border border-red-500/20 bg-slate-custom p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-400">
            Missing session
          </h2>
          <p className="text-sm text-slate-400">
            Please join via an invite link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <RoomView token={token} livekitUrl={livekitUrl} participantName={name} />
  );
}
