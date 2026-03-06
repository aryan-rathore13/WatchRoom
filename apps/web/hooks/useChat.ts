"use client";

import { useState, useCallback, useEffect } from "react";
import { RoomEvent, type Room } from "livekit-client";
import type { ChatMessage } from "@watchroom/types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function useChat(room: Room | undefined, localName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!room) return;

    const handleData = (
      payload: Uint8Array,
      participant: { identity?: string } | undefined
    ) => {
      try {
        const msg: ChatMessage = JSON.parse(decoder.decode(payload));
        if (msg.type === "chat") {
          setMessages((prev) => [...prev, msg]);
        }
      } catch {
        // ignore non-chat messages
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!room || !text.trim()) return;

      const msg: ChatMessage = {
        type: "chat",
        name: localName,
        text: text.trim(),
        ts: Date.now(),
      };

      await room.localParticipant.publishData(
        encoder.encode(JSON.stringify(msg)),
        { reliable: true }
      );

      setMessages((prev) => [...prev, msg]);
    },
    [room, localName]
  );

  return { messages, sendMessage };
}
