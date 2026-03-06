"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@watchroom/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatPanelProps {
  messages: ChatMessageType[];
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, onSend, onClose }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full w-80 flex-col border-l border-primary/10 bg-background-dark">
      <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
          Chat
        </h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-slate-500">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)
        )}
      </div>
      <ChatInput onSend={onSend} />
    </div>
  );
}
