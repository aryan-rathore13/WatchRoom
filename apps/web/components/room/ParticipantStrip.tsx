"use client";

import { useParticipants } from "@livekit/components-react";

export function ParticipantStrip() {
  const participants = useParticipants();

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {participants.slice(0, 5).map((p) => (
          <div
            key={p.identity}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background-dark bg-primary/20 text-[10px] font-bold text-primary"
            title={p.identity}
          >
            {p.identity.charAt(0).toUpperCase()}
          </div>
        ))}
        {participants.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background-dark bg-primary/10 text-[9px] font-bold text-primary">
            +{participants.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-slate-400">
        {participants.length} in room
      </span>
    </div>
  );
}
