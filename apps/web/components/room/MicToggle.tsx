"use client";

import { useLocalParticipant } from "@livekit/components-react";
import { Mic, MicOff } from "lucide-react";

export function MicToggle() {
  const { localParticipant } = useLocalParticipant();
  const isMuted = !localParticipant.isMicrophoneEnabled;

  const toggle = async () => {
    await localParticipant.setMicrophoneEnabled(isMuted);
  };

  return (
    <button
      onClick={toggle}
      className={`rounded-lg p-3 transition-colors ${
        isMuted
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
