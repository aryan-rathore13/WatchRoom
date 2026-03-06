"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-primary/10 p-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-lg border border-primary/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-primary/30"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary/20 p-2 text-primary transition-colors hover:bg-primary/30"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
