"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ArrowRight, Loader2 } from "lucide-react";
import { createRoom } from "@/lib/api";
import type { CreateRoomResponse } from "@watchroom/types";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onEnterRoom: (
    roomId: string,
    token: string,
    livekitUrl: string,
    name: string
  ) => void;
}

export function CreateRoomModal({
  open,
  onClose,
  onEnterRoom,
}: CreateRoomModalProps) {
  const [step, setStep] = useState<"name" | "share">("name");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<CreateRoomResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteUrl = roomData
    ? `${window.location.origin}/join/${roomData.inviteCode}`
    : "";

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const res = await createRoom({ hostName: name.trim() });
      setRoomData(res);
      setStep("share");
    } catch {
      setError("Failed to create room. Is the API running?");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnter = () => {
    if (!roomData) return;
    onEnterRoom(roomData.roomId, roomData.token, roomData.livekitUrl, name.trim());
  };

  const handleClose = () => {
    setStep("name");
    setName("");
    setRoomData(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-[#111110] shadow-2xl shadow-primary/5">
              {/* Glow accent */}
              <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-8">
                <AnimatePresence mode="wait">
                  {step === "name" ? (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {/* Header */}
                      <div className="mb-8">
                        <div className="mb-3 inline-flex items-center gap-2 text-primary">
                          <span className="h-px w-6 bg-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            New Room
                          </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white">
                          Create your room
                        </h2>
                        <p className="mt-2 text-sm font-light text-slate-400">
                          Enter your name to get started. You&apos;ll get a
                          shareable link for your friends.
                        </p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleCreate} className="flex flex-col gap-5">
                        <div>
                          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            autoFocus
                            maxLength={30}
                            required
                            className="w-full rounded-xl border border-primary/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-primary/30 focus:bg-white/[0.07]"
                          />
                        </div>

                        {error && (
                          <p className="text-xs text-red-400">{error}</p>
                        )}

                        <button
                          type="submit"
                          disabled={creating || !name.trim()}
                          className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-widest text-black transition-all hover:brightness-110 disabled:opacity-40"
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Create Room
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="share"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      {/* Header */}
                      <div className="mb-8">
                        <div className="mb-3 inline-flex items-center gap-2 text-primary">
                          <span className="h-px w-6 bg-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            Room Ready
                          </span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white">
                          Share with friends
                        </h2>
                        <p className="mt-2 text-sm font-light text-slate-400">
                          Send this link to anyone you want in the room. They
                          can join instantly.
                        </p>
                      </div>

                      {/* Invite Info Card */}
                      <div className="mb-6 rounded-xl border border-primary/10 bg-white/[0.03] p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              Invite Code
                            </p>
                            <p className="mt-1 font-mono text-lg font-bold tracking-wider text-primary">
                              {roomData?.inviteCode}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary pulse-dot" />
                          </div>
                        </div>

                        {/* Copy URL */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 overflow-hidden rounded-lg border border-primary/10 bg-black/30 px-3 py-2.5">
                            <p className="truncate text-xs text-slate-400">
                              {inviteUrl}
                            </p>
                          </div>
                          <button
                            onClick={handleCopy}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all ${
                              copied
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-primary/10 bg-white/5 text-slate-400 hover:border-primary/20 hover:text-white"
                            }`}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {copied && (
                          <p className="mt-2 text-[11px] font-medium text-primary">
                            Copied to clipboard
                          </p>
                        )}
                      </div>

                      {/* Enter Room */}
                      <button
                        onClick={handleEnter}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-widest text-black transition-all hover:brightness-110"
                      >
                        Enter Room
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <p className="mt-4 text-center text-[11px] text-slate-600">
                        You can also share the link after entering the room
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
