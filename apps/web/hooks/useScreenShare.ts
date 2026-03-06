"use client";

import { useCallback, useState } from "react";
import type { Room } from "livekit-client";

export function useScreenShare(room: Room | undefined) {
  const [isSharing, setIsSharing] = useState(false);

  const toggleScreenShare = useCallback(async () => {
    if (!room) return;

    if (isSharing) {
      await room.localParticipant.setScreenShareEnabled(false);
      setIsSharing(false);
    } else {
      await room.localParticipant.setScreenShareEnabled(true, {
        audio: true,
        contentHint: "detail",
        suppressLocalAudioPlayback: true,
        resolution: { width: 1920, height: 1080, frameRate: 30 },
      });
      setIsSharing(true);
    }
  }, [room, isSharing]);

  return { isSharing, toggleScreenShare };
}
