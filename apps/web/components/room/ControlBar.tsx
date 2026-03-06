"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, PhoneOff, Info, Copy, Check } from "lucide-react";
import { MicToggle } from "./MicToggle";
import { ScreenShareButton } from "./ScreenShareButton";
import { FullscreenButton } from "./FullscreenButton";
import { ParticipantStrip } from "./ParticipantStrip";
import { useFullscreen } from "@/hooks/useFullscreen";

interface ControlBarProps {
  onToggleChat: () => void;
  onEndMeeting: () => void;
  chatOpen: boolean;
  unreadCount: number;
  inviteCode?: string;
}

export function ControlBar({
  onToggleChat,
  onEndMeeting,
  chatOpen,
  unreadCount,
  inviteCode,
}: ControlBarProps) {
  const { isFullscreen } = useFullscreen();
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`
    : "";

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {inviteCode && (
          <div className="relative">
            <button
              onClick={() => setShowInvite((o) => !o)}
              className={`rounded-lg p-3 transition-colors ${
                showInvite
                  ? "bg-primary/20 text-primary"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Invite link"
            >
              <Info className="h-5 w-5" />
            </button>
            {showInvite && (
              <div className="absolute bottom-full left-1/2 mb-3 w-72 -translate-x-1/2 rounded-xl border border-primary/10 bg-[#111110] p-4 shadow-2xl shadow-black/50">
                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-primary/10 bg-[#111110]" />
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Invite Link
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden rounded-lg border border-primary/10 bg-black/30 px-3 py-2">
                    <p className="truncate text-xs text-slate-400">{inviteUrl}</p>
                  </div>
                  <button
                    onClick={handleCopyInvite}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      copied
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-primary/10 bg-white/5 text-slate-400 hover:border-primary/20 hover:text-white"
                    }`}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {copied && (
                  <p className="mt-1.5 text-[11px] font-medium text-primary">
                    Copied to clipboard
                  </p>
                )}
              </div>
            )}
          </div>
        )}
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

        <div className="ml-2 h-6 w-px bg-white/10" />

        <button
          onClick={onEndMeeting}
          className="rounded-lg bg-red-500/20 p-3 text-red-400 transition-colors hover:bg-red-500/30"
          title="End meeting"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
