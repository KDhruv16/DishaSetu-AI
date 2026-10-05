import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, User } from 'lucide-react';

/**
 * CandidateVideoTile Component
 * 
 * Renders local candidate camera stream with real-time mic volume level meter
 * and video feed controls.
 */
export const CandidateVideoTile = ({
  stream,
  candidateName = 'Candidate',
  isMicMuted = false,
  isVideoOff = false,
  volumeLevel = 0,
  isListening = false
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full min-h-[220px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-xl flex flex-col justify-between">
      {/* Video Stream or Fallback */}
      {!isVideoOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover object-center scale-x-[-1]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-xs font-semibold text-slate-300">Camera Paused</p>
        </div>
      )}

      {/* Top Overlay: Candidate Info & Active Listening status */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isMicMuted ? 'bg-rose-500' : 'bg-emerald-400'}`} />
            <span className="text-white text-xs font-bold drop-shadow">
              {candidateName} <span className="text-slate-400 font-normal">(You)</span>
            </span>
          </div>
        </div>

        {/* Real-Time Microphone Decibel / Volume Level Visualizer */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
          {isMicMuted ? (
            <MicOff className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`} />
          )}

          {/* Volume bars */}
          {!isMicMuted && (
            <div className="flex items-end gap-0.5 h-3 w-8">
              {[20, 40, 60, 80, 100].map((threshold, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    volumeLevel >= threshold
                      ? 'bg-emerald-400'
                      : 'bg-slate-600'
                  }`}
                  style={{
                    height: `${Math.max(20, (threshold / 100) * 12)}px`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Overlay: Speaking status */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isListening && !isMicMuted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Microphone Active
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Local Candidate Feed
        </span>
      </div>
    </div>
  );
};
