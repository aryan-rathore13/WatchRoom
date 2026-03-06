"use client";

import { useEffect, useRef, useState } from "react";

interface ImageSequencePlayerProps {
  frames: string[];
  fps?: number;
  className?: string;
}

export function ImageSequencePlayer({
  frames,
  fps = 8,
  className = "",
}: ImageSequencePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const [loaded, setLoaded] = useState(false);

  // Preload all frames into Image objects
  useEffect(() => {
    if (frames.length === 0) return;

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    frames.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frames.length) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frames.length) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      img.src = src;
      images[i] = img;
    });
  }, [frames]);

  // Draw to canvas using requestAnimationFrame
  useEffect(() => {
    if (!loaded || frames.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interval = 1000 / fps;

    const tick = (time: number) => {
      if (time - lastTimeRef.current >= interval) {
        lastTimeRef.current = time;
        frameRef.current = (frameRef.current + 1) % frames.length;

        const img = imagesRef.current[frameRef.current];
        if (img && img.complete) {
          canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
          canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };

    // Draw first frame immediately
    const firstImg = imagesRef.current[0];
    if (firstImg) {
      canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
      ctx.drawImage(firstImg, 0, 0, canvas.width, canvas.height);
    }

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [loaded, frames.length, fps]);

  if (frames.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-custom via-[#111] to-black" />
      )}
    </div>
  );
}
