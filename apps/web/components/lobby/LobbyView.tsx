"use client";

import { useState, type FormEvent } from "react";
import { MicLevelMeter } from "./MicLevelMeter";

interface LobbyViewProps {
  hostName?: string;
  onJoin: (name: string) => void;
  loading?: boolean;
}

export function LobbyView({ hostName, onJoin, loading }: LobbyViewProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) onJoin(name.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-dark px-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/10 bg-slate-custom p-8">
        <h2 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
          Join Room
        </h2>
        {hostName && (
          <p className="mb-6 text-sm text-slate-400">
            Hosted by <span className="font-bold text-primary">{hostName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-primary/10 bg-black/30 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-primary/30"
              maxLength={30}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Mic Test
            </label>
            <MicLevelMeter />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Join Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
