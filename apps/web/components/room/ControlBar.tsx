"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { MicToggle } from "./MicToggle";
import { ScreenShareButton } from "./ScreenShareButton";
import { FullscreenButton } from "./FullscreenButton";
import { ParticipantStrip } from "./ParticipantStrip";
import { useFullscreen } from "@/hooks/useFullscreen";

interface ControlBarProps {
  onToggleChat: () => void;
  chatOpen: boolean;
  unreadCount: number;
}

export function ControlBar({
  onToggleChat,
  chatOpen,
  unreadCount,
}: ControlBarProps) {
  const { isFullscreen } = useFullscreen();
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFullscreen) {
      setVisible(true);
      return;
    }

    const show = () => {
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(false), 3000);
    };

    show();
    window.addEventListener("mousemove", show);
    return () => {
      window.removeEventListener("mousemove", show);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isFullscreen]);

  return (
    <div
      className={`flex items-center justify-between border-t border-primary/10 bg-background-dark/95 px-4 py-3 backdrop-blur-md transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ParticipantStrip />

      <div className="flex items-center gap-2">
        <MicToggle />
        <ScreenShareButton />
        <button
          onClick={onToggleChat}
          className={`relative rounded-lg p-3 transition-colors ${
            chatOpen
              ? "bg-primary/20 text-primary"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          title="Toggle chat"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && !chatOpen && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <FullscreenButton />
      </div>
    </div>
  );
}
