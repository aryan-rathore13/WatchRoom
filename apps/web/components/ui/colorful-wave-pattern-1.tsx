"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ElectricWavesShaderProps {
  waveCount?: number;
  amplitude?: number;
  frequency?: number;
  brightness?: number;
  colorSeparation?: number;
}

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uWaveCount;
  uniform float uAmplitude;
  uniform float uFrequency;
  uniform float uBrightness;
  uniform float uColorSeparation;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec3 color = vec3(0.0);

    for (float i = 0.0; i < 20.0; i++) {
      if (i >= uWaveCount) break;

      float offset = i * 0.15;
      float speed = uTime * (0.3 + i * 0.05);

      float wave = sin(uv.x * uFrequency * (1.0 + i * 0.5) + speed + offset) * uAmplitude;
      wave += sin(uv.x * uFrequency * 2.0 + speed * 1.5 + i) * uAmplitude * 0.5;

      float dist = abs(uv.y - 0.5 - wave);
      float glow = uBrightness / (dist + 0.01);

      float r = glow * (0.87 + sin(i * uColorSeparation) * 0.13);
      float g = glow * (1.0);
      float b = glow * (0.0 + cos(i * uColorSeparation * 2.0) * 0.1);

      color += vec3(r, g, b);
    }

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function ElectricWavesShader({
  waveCount = 8,
  amplitude = 0.08,
  frequency = 3.0,
  brightness = 0.004,
  colorSeparation = 0.12,
}: ElectricWavesShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      },
      uWaveCount: { value: waveCount },
      uAmplitude: { value: amplitude },
      uFrequency: { value: frequency },
      uBrightness: { value: brightness },
      uColorSeparation: { value: colorSeparation },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniforms.uResolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let frameId: number;
    const tick = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [mounted, waveCount, amplitude, frequency, brightness, colorSeparation]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}
