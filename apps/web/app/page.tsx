"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  AudioLines,
  ShieldCheck,
  Mic,
  Monitor,
  MessageSquare,
  Maximize,
} from "lucide-react";
import { CreateRoomModal } from "@/components/room/CreateRoomModal";
import ElectricWavesShader from "@/components/ui/colorful-wave-pattern-1";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { ImageSequencePlayer } from "@/components/ui/image-sequence-player";

// Generate frame paths: /frames/city-001.webp through /frames/city-064.webp
const heroFrames = Array.from(
  { length: 64 },
  (_, i) => `/frames/city-${String(i + 1).padStart(3, "0")}.webp`
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleEnterRoom = (
    roomId: string,
    token: string,
    livekitUrl: string,
    name: string
  ) => {
    const params = new URLSearchParams({ token, livekitUrl, name });
    router.push(`/room/${roomId}?${params.toString()}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-background-dark/80 px-6 py-4 backdrop-blur-md lg:px-20">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2 text-primary">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <h2 className="text-xl font-extrabold uppercase tracking-tighter">
              Watchroom
            </h2>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-primary"
              href="#"
            >
              Discover
            </a>
            <a
              className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-primary"
              href="#"
            >
              Gallery
            </a>
            <a
              className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-primary"
              href="#"
            >
              Pricing
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">
              1,248 Live Rooms
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-primary px-6 py-2 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-105"
          >
            Join Now
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen overflow-hidden">
          <ElectricWavesShader
            waveCount={8}
            amplitude={0.08}
            frequency={3.0}
            brightness={0.004}
            colorSeparation={0.12}
          />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 z-[1] h-48 bg-gradient-to-b from-transparent to-[#0a0a08]" />

          <div className="relative z-10 flex min-h-screen items-center px-6 py-20 lg:px-20 lg:py-32">
            <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-10">
              {/* Left — 60% */}
              <div className="flex flex-col gap-8 lg:col-span-6">
                <div className="inline-flex items-center gap-2 text-primary">
                  <span className="h-px w-8 bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Cinematic Synchronization
                  </span>
                </div>
                <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-white md:text-8xl">
                  THE ART OF <br />
                  <span className="italic text-primary">SHARED</span> VIEWING.
                </h1>
                <p className="max-w-md text-lg font-light leading-relaxed text-slate-400">
                  A high-end social platform engineered for curated content,
                  ultra-low latency, and professional-grade watch parties.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="rounded-lg bg-primary px-10 py-5 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(223,255,0,0.2)] transition-all hover:brightness-110"
                  >
                    Create Master Room
                  </button>
                  <button className="rounded-lg border border-primary/30 px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary/5">
                    Explore Catalog
                  </button>
                </div>
              </div>

              {/* Right — 40% */}
              <div className="relative lg:col-span-4">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 aspect-[4/5] overflow-hidden rounded-xl border border-primary/20 bg-slate-custom shadow-2xl"
                >
                  <ImageSequencePlayer
                    frames={heroFrames}
                    fps={8}
                    className="absolute inset-0 h-full w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent" />
                  {/* Floating Glass UI Mockup */}
                  <div className="glass-border absolute bottom-6 left-6 right-6 rounded-lg bg-black/40 p-4 backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-8 w-8 rounded-full border-2 border-background-dark bg-gradient-to-br from-primary/40 to-primary/10"
                          />
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background-dark bg-primary text-[10px] font-black text-black">
                          +12
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-primary">
                        Live Sync 4K
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-2/3 bg-primary" />
                    </div>
                  </div>
                </motion.div>
                {/* Corner accents */}
                <div className="absolute -right-10 -top-10 h-40 w-40 border-r border-t border-primary/20" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 border-b border-l border-primary/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Product Reveal */}
        <section className="bg-[#0a0a08]">
          <ContainerScroll
            titleComponent={
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Product Preview
                </span>
                <h2 className="mt-4 text-5xl font-black tracking-tighter text-white md:text-7xl">
                  THE ROOM.
                </h2>
                <p className="mt-4 max-w-md text-lg font-light text-slate-400">
                  Share any screen. Everyone watches live.
                </p>
              </div>
            }
          >
            {/* Static Room UI Mockup */}
            <div className="flex h-full flex-col gap-4">
              {/* Screen share area */}
              <div className="flex flex-1 items-center justify-center rounded-xl border border-primary/20 bg-black/50 shadow-[0_0_40px_rgba(223,255,0,0.05)]">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Monitor className="h-12 w-12" />
                  <span className="text-sm font-medium">
                    Screen share active
                  </span>
                </div>
              </div>
              {/* Participant strip */}
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-[#0a0a08] bg-gradient-to-br from-primary/30 to-primary/5"
                    />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a0a08] bg-primary/20 text-[9px] font-bold text-primary">
                    +7
                  </div>
                </div>
                {/* Control icons */}
                <div className="flex items-center gap-4">
                  <Mic className="h-5 w-5 text-slate-400" />
                  <Monitor className="h-5 w-5 text-primary" />
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  <Maximize className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </ContainerScroll>
        </section>

        {/* Feature Strip */}
        <section className="border-y border-primary/10 bg-slate-custom/50 py-16">
          <div className="grid grid-cols-1 gap-12 px-6 md:grid-cols-3 lg:px-20">
            {[
              {
                icon: Zap,
                title: "HYPER-SYNC",
                desc: "Zero-latency engine designed for frame-perfect playback across global nodes.",
                first: true,
              },
              {
                icon: AudioLines,
                title: "SPATIAL CHAT",
                desc: "High-fidelity voice integration that mimics the acoustics of a private theatre.",
                first: false,
              },
              {
                icon: ShieldCheck,
                title: "OBSIDIAN PRIVACY",
                desc: "End-to-end encryption for private screenings and invite-only premieres.",
                first: false,
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`group relative overflow-hidden rounded-xl border-t-2 p-6 pt-6 ${
                  f.first
                    ? "border-primary"
                    : "border-primary/30 hover:border-primary"
                } transition-colors`}
              >
                <GlowingEffect
                  spread={40}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                  glow
                />
                <f.icon className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
                <p className="text-sm font-light leading-relaxed text-slate-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* The Blueprint */}
        <section className="px-6 py-24 lg:px-20">
          <div className="flex flex-col gap-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black uppercase tracking-tighter">
                THE BLUEPRINT
              </h2>
              <p className="mt-4 font-light text-slate-400">
                Elevate your digital viewing experience in three calculated
                movements.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-24 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  num: "01",
                  label: "Discovery",
                  title: "CURATE YOUR GALLERY",
                  desc: "Connect your premium streaming libraries or upload custom cinematic content directly to our cloud.",
                  offset: false,
                },
                {
                  num: "02",
                  label: "Orchestration",
                  title: "INVITE THE CIRCLE",
                  desc: "Generate encrypted glass-links to invite your inner circle to an exclusive, synchronized event.",
                  offset: true,
                },
                {
                  num: "03",
                  label: "Immersion",
                  title: "UNIFIED PLAYBACK",
                  desc: "Experience films exactly as they were intended: together, in perfect 4K HDR synchronization.",
                  offset: false,
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className={`group relative ${step.offset ? "lg:mt-24" : ""}`}
                >
                  <span className="pointer-events-none absolute -left-4 -top-12 select-none text-[9rem] font-black leading-none text-primary/5 transition-all group-hover:text-primary/10">
                    {step.num}
                  </span>
                  <div className="relative z-10 pl-4">
                    <h4 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary">
                      {step.label}
                    </h4>
                    <h3 className="mb-4 text-2xl font-bold">{step.title}</h3>
                    <p className="font-light text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Band */}
        <section className="bg-primary px-6 py-24 lg:px-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-3xl font-light italic leading-tight tracking-tight text-black md:text-5xl">
              &ldquo;Watchroom has completely redefined how we host digital
              premieres. The latency is nonexistent, and the aesthetic is pure
              luxury.&rdquo;
            </p>
            <div className="mt-12 flex flex-col items-center gap-2">
              <div className="h-px w-12 bg-black/20" />
              <p className="text-xs font-black uppercase tracking-widest text-black">
                Julian Vose — Creative Director at Avenir
              </p>
            </div>
          </div>
        </section>

        {/* CTA Footer Band */}
        <footer className="border-t border-primary/10 bg-background-dark pb-12 pt-24">
          <div className="px-6 lg:px-20">
            <div className="mb-20 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="mb-6 text-5xl font-black tracking-tighter text-white">
                  READY TO <span className="italic text-primary">SYNC</span>?
                </h2>
                <p className="text-lg font-light text-slate-400">
                  Join the elite network of viewers setting the new standard for
                  digital cinema.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full rounded-lg bg-primary px-16 py-6 text-lg font-black uppercase tracking-widest text-black transition-all hover:scale-105 lg:w-auto"
              >
                Get Started Free
              </button>
            </div>

            {/* Footer Links */}
            <div className="grid grid-cols-2 gap-12 border-t border-primary/5 pt-16 md:grid-cols-4">
              {[
                {
                  heading: "Platform",
                  links: ["Live Rooms", "Studio Engine", "Integrations"],
                },
                {
                  heading: "Company",
                  links: ["Journal", "Careers", "About"],
                },
                {
                  heading: "Legal",
                  links: ["Privacy", "Terms", "Security"],
                },
                {
                  heading: "Social",
                  links: ["Instagram", "X / Twitter", "Discord"],
                },
              ].map((col) => (
                <div key={col.heading} className="flex flex-col gap-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    {col.heading}
                  </p>
                  {col.links.map((link) => (
                    <a
                      key={link}
                      className="text-sm font-light text-slate-400 hover:text-white"
                      href="#"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-primary/5 pt-8 opacity-30 md:flex-row">
              <p className="text-[10px] font-bold uppercase tracking-widest">
                &copy; 2024 WATCHROOM TECHNOLOGIES. ALL RIGHTS RESERVED.
              </p>
              <div className="flex items-center gap-4 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Obsidian Encryption Enabled
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <CreateRoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnterRoom={handleEnterRoom}
      />
    </div>
  );
}
