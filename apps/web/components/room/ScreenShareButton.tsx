"use client";

import { useRoomContext } from "@livekit/components-react";
import { Monitor, MonitorOff } from "lucide-react";
import { useScreenShare } from "@/hooks/useScreenShare";

export function ScreenShareButton() {
  const room = useRoomContext();
  const { isSharing, toggleScreenShare } = useScreenShare(room);

  const supportsScreenShare =
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getDisplayMedia !== "undefined";

  if (!supportsScreenShare) return null;

  return (
    <button
      onClick={toggleScreenShare}
      className={`rounded-lg p-3 transition-colors ${
        isSharing
          ? "bg-primary/20 text-primary hover:bg-primary/30"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
      title={isSharing ? "Stop sharing" : "Share screen"}
    >
      {isSharing ? (
        <MonitorOff className="h-5 w-5" />
      ) : (
        <Monitor className="h-5 w-5" />
      )}
    </button>
  );
}
