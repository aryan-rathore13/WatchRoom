"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";

interface GlowingEffectProps {
  disabled?: boolean;
  spread?: number;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
  glow?: boolean;
}

export function GlowingEffect({
  disabled = false,
  spread = 40,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 3,
  glow = false,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const el = containerRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    const handleMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distFromCenter = Math.sqrt(
        ((x - centerX) / centerX) ** 2 + ((y - centerY) / centerY) ** 2
      );

      if (distFromCenter < inactiveZone) {
        el.style.opacity = "0";
        return;
      }

      const isInProximity =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity;

      if (!isInProximity) {
        el.style.opacity = "0";
        return;
      }

      const angle =
        (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 180;

      animate(
        el,
        {
          opacity: 1,
          background: `conic-gradient(from ${angle - spread / 2}deg at ${x}px ${y}px, #dfff00 0deg, transparent ${spread}deg, transparent 360deg)`,
        },
        { duration: 0.3 }
      );
    };

    const handleLeave = () => {
      animate(el, { opacity: glow ? 0.3 : 0 }, { duration: 0.5 });
    };

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseleave", handleLeave);

    if (glow) {
      el.style.opacity = "0.3";
      el.style.background =
        "radial-gradient(circle at 50% 50%, #dfff00, transparent 70%)";
    }

    return () => {
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("mouseleave", handleLeave);
    };
  }, [disabled, spread, proximity, inactiveZone, glow]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 opacity-0"
      style={{
        maskImage: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        padding: `${borderWidth}px`,
        borderRadius: "inherit",
      }}
    />
  );
}
