"use client";

import { forwardRef } from "react";
import { useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export const VideoStage = forwardRef<HTMLDivElement>(function VideoStage(_, ref) {
  const screenShareTracks = useTracks(
    [Track.Source.ScreenShare, Track.Source.ScreenShareAudio],
    { onlySubscribed: true }
  );

  const videoTrack = screenShareTracks.find(
    (t) => t.source === Track.Source.ScreenShare
  );
  const audioTrack = screenShareTracks.find(
    (t) => t.source === Track.Source.ScreenShareAudio
  );

  if (!videoTrack?.publication?.track) {
    return (
      <div ref={ref} className="flex h-full w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <svg
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z"
            />
          </svg>
          <p className="text-sm font-medium">Waiting for screen share...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="h-full w-full bg-black">
      <video
        ref={(el) => {
          if (el && videoTrack.publication?.track) {
            videoTrack.publication.track.attach(el);
          }
        }}
        className="h-full w-full object-contain"
        autoPlay
        playsInline
      />
      {audioTrack?.publication?.track && (
        <audio
          ref={(el) => {
            if (el && audioTrack.publication?.track) {
              audioTrack.publication.track.attach(el);
            }
          }}
          autoPlay
        />
      )}
    </div>
  );
});
