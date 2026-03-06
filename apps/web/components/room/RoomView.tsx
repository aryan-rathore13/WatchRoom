"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from "@livekit/components-react";
import { VideoStage } from "./VideoStage";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useChat } from "@/hooks/useChat";
import { useFullscreen } from "@/hooks/useFullscreen";

interface RoomViewProps {
  token: string;
  livekitUrl: string;
  participantName: string;
}

function RoomInner({ participantName }: { participantName: string }) {
  const router = useRouter();
  const room = useRoomContext();
  const { messages, sendMessage } = useChat(room, participantName);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMsgCount = useRef(0);
  const { isFullscreen } = useFullscreen();

  useEffect(() => {
    if (!chatOpen && messages.length > prevMsgCount.current) {
      setUnreadCount((c) => c + (messages.length - prevMsgCount.current));
    }
    prevMsgCount.current = messages.length;
  }, [messages, chatOpen]);

  const toggleChat = () => {
    setChatOpen((o) => !o);
    if (!chatOpen) setUnreadCount(0);
  };

  const handleEndMeeting = async () => {
    await room.disconnect();
    router.push("/");
  };

  return (
    <div
      className={`flex h-screen bg-black ${isFullscreen ? "fixed inset-0 z-[9999]" : ""}`}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <VideoStage />
        </div>
        <ControlBar
          onToggleChat={toggleChat}
          onEndMeeting={handleEndMeeting}
          chatOpen={chatOpen}
          unreadCount={unreadCount}
        />
      </div>
      {chatOpen && (
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          onClose={() => setChatOpen(false)}
        />
      )}
      <RoomAudioRenderer />
    </div>
  );
}

export function RoomView({ token, livekitUrl, participantName }: RoomViewProps) {
  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
    >
      <RoomInner participantName={participantName} />
    </LiveKitRoom>
  );
}
