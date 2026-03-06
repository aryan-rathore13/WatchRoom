"use client";

import { useEffect, useRef, useState } from "react";

export function MicLevelMeter() {
  const [level, setLevel] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg =
            dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
          setLevel(avg / 255);
          animRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // mic not available
      }
    };

    start();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-75"
          style={{ width: `${Math.min(level * 100, 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400">Mic</span>
    </div>
  );
}
