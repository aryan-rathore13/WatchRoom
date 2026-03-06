"use client";

import type { RefObject } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useFullscreen } from "@/hooks/useFullscreen";

interface FullscreenButtonProps {
  stageRef?: RefObject<HTMLDivElement | null>;
}

export function FullscreenButton({ stageRef }: FullscreenButtonProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <button
      onClick={() => toggleFullscreen(stageRef?.current)}
      className="rounded-lg bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="h-5 w-5" />
      ) : (
        <Maximize className="h-5 w-5" />
      )}
    </button>
  );
}
