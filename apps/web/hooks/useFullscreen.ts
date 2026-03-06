"use client";

import { useState, useCallback, useEffect, useRef } from "react";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const manualRef = useRef(false);

  useEffect(() => {
    const onChange = () => {
      const fs = !!(
        document.fullscreenElement ||
        (document as unknown as Record<string, unknown>).webkitFullscreenElement
      );
      setIsFullscreen(fs);
      if (!fs) manualRef.current = false;
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async (targetEl?: HTMLElement | null) => {
    const doc = document as unknown as Record<string, unknown>;
    const currentFs = document.fullscreenElement || doc.webkitFullscreenElement;

    if (currentFs) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (typeof doc.webkitExitFullscreen === "function") {
        (doc.webkitExitFullscreen as () => void)();
      }
      manualRef.current = false;
      setIsFullscreen(false);
      return;
    }

    // On iOS Safari, try webkitEnterFullscreen on a video element
    if (isIOS() && targetEl) {
      const video = targetEl.tagName === "VIDEO"
        ? targetEl
        : targetEl.querySelector("video");
      if (video) {
        const v = video as unknown as Record<string, unknown>;
        if (typeof v.webkitEnterFullscreen === "function") {
          (v.webkitEnterFullscreen as () => void)();
          setIsFullscreen(true);
          return;
        }
      }
      // Fallback: CSS-based fullscreen for iOS when no video
      manualRef.current = true;
      setIsFullscreen(true);
      return;
    }

    // Standard fullscreen API
    const el = targetEl || document.documentElement;
    const e = el as unknown as Record<string, unknown>;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (typeof e.webkitRequestFullscreen === "function") {
      (e.webkitRequestFullscreen as () => void)();
    } else {
      // Fallback: CSS-based
      manualRef.current = true;
      setIsFullscreen(true);
    }
  }, []);

  return { isFullscreen, toggleFullscreen, isManualFullscreen: manualRef.current };
}
