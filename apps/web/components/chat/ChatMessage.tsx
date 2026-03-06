"use client";

import type { ChatMessage as ChatMessageType } from "@watchroom/types";

export function ChatMessage({ msg }: { msg: ChatMessageType }) {
  const time = new Date(msg.ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-1 px-4 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-primary">{msg.name}</span>
        <span className="text-[10px] text-slate-500">{time}</span>
      </div>
      <p className="text-sm text-slate-300">{msg.text}</p>
    </div>
  );
}
