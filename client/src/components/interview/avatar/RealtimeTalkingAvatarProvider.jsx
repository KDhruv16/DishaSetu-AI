import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  Brain,
  Sparkles,
  Info,
  Radio,
  Cpu,
  ShieldCheck,
  Video,
  Play,
  RotateCcw,
  Mic
} from 'lucide-react';
import { DEFAULT_AVATAR_CONFIG } from './avatarConfig';

/**
 * RealtimeTalkingAvatarProvider
 * 
 * Strict Pre-Generated Video Interview Architecture:
 * - Plays local pre-generated realistic human interviewer MP4 videos in sequence:
 *     * Video 1: intro.mp4 (with original embedded audio enabled)
 *     * Video 2: 1st question.mp4 (with original embedded audio enabled)
 *     * Video 3+: next-question.mp4, etc.
 * - When a video reaches the end:
 *     * STOPS completely on the final frame (no looping, no auto-advance).
 *     * Enters WAITING_FOR_CANDIDATE state.
 *     * Candidate speaks into microphone -> live real-time transcript.
 *     * ONLY clicking "Submit & Next Question" can advance to the next video!
 * - Video audio is unmuted (video.muted = false, volume = 1) for all pre-generated videos.
 * - Gemini TTS is completely disabled during this pre-generated video flow.
 */
export const RealtimeTalkingAvatarProvider = ({
  currentVideo,
  videoSrc: propVideoSrc,
  isVideoPlaying = true,
  isWaitingForCandidate = false,
  onVideoEnded,
  onReplay,
  config = DEFAULT_AVATAR_CONFIG,
  topic = 'Technical Interview',
  // legacy props for full backward compatibility
  text = '',
  audio = null,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  interviewerState,
  videoState,
  onIntroEnd,
  onClosingEnd,
  questionIndex = 0
}) => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const videoRef = useRef(null);

  const {
    interviewer = DEFAULT_AVATAR_CONFIG.interviewer
  } = config;

  // Resolve the active video URL
  const activeVideoSrc = useMemo(() => {
    let raw = currentVideo?.src || propVideoSrc;
    if (!raw) {
      if (videoState === 'speaking' || questionIndex > 0) {
        raw = '/avatars/1st%20question.mp4';
      } else {
        raw = '/avatars/intro.mp4';
      }
    }
    return encodeURI(decodeURI(raw));
  }, [currentVideo, propVideoSrc, videoState, questionIndex]);

  // Manage video playback, muting, and autoplay policy recovery
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Pre-generated videos play with their ORIGINAL embedded audio
    vid.muted = false;
    vid.defaultMuted = false;
    vid.volume = 1;

    if (isVideoPlaying) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.debug('[Avatar Video] Play deferred by browser policy:', err.message);
          // Attach one-time gesture listener to play on candidate's first interaction anywhere
          const handleFirstClick = () => {
            if (vid && isVideoPlaying) {
              vid.muted = false;
              vid.volume = 1;
              vid.play().catch(console.warn);
            }
          };
          ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
            window.addEventListener(evt, handleFirstClick, { once: true, passive: true });
          });
        });
      }
    } else {
      vid.pause();
    }
  }, [activeVideoSrc, isVideoPlaying]);

  // Handle video finished playback
  const handleEnded = () => {
    const vid = videoRef.current;
    if (vid) {
      vid.pause();
    }
    // CRITICAL: NEVER automatically start the next video!
    // Simply notify parent to enter WAITING_FOR_CANDIDATE state
    if (onVideoEnded) {
      onVideoEnded();
    }
  };

  // Replay current video
  const handleReplayClick = () => {
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      vid.muted = false;
      vid.volume = 1;
      vid.play().catch(console.warn);
    }
    if (onReplay) {
      onReplay();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[440px] max-h-[660px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      
      {/* Dynamic Ambient Background Glow */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isVideoPlaying 
            ? 'opacity-35 bg-radial from-brand-600/40 via-transparent to-transparent' 
            : isWaitingForCandidate 
            ? 'opacity-25 bg-radial from-emerald-500/30 via-transparent to-transparent'
            : 'opacity-15 bg-radial from-slate-700/25 via-transparent to-transparent'
        }`} 
      />

      {/* Top Video Conference Overlay Header */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-black/85 via-black/45 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3.5 h-3.5 rounded-full ${
              isVideoPlaying 
                ? 'bg-emerald-400 ring-4 ring-emerald-500/30 animate-pulse' 
                : isWaitingForCandidate 
                ? 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse'
                : 'bg-brand-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm sm:text-base font-bold tracking-wide font-display drop-shadow">
                {interviewer.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15 backdrop-blur-md flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-brand-300" />
                AI Interviewer
              </span>
            </div>
            <p className="text-[11px] text-slate-300 drop-shadow-sm font-medium">
              {interviewer.title}
            </p>
          </div>
        </div>

        {/* Right Header: Video State badge & Topic */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-[11px] font-mono text-emerald-400">
            {isVideoPlaying ? (
              <>
                <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
                <span className="capitalize text-cyan-300">Interviewer Speaking</span>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3 animate-pulse text-emerald-400" />
                <span className="capitalize text-emerald-300">Candidate Turn</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] font-medium text-slate-300">Topic:</span>
            <span className="text-[11px] font-bold text-white max-w-[150px] truncate">{topic}</span>
          </div>
        </div>
      </div>

      {/* Main Human Video Presentation Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-[640px] max-h-[640px] flex items-center justify-center p-2">
          
          {/* Active Pre-Generated Interview Video (Original Embedded Audio) */}
          <video
            ref={videoRef}
            key={activeVideoSrc}
            src={activeVideoSrc}
            playsInline
            preload="auto"
            muted={false}
            onEnded={handleEnded}
            onError={() => {
              console.warn('[Avatar Video] Video asset load notice:', activeVideoSrc);
              if (onVideoEnded) onVideoEnded();
            }}
            className="w-full h-full object-cover object-center rounded-2xl shadow-2xl brightness-100"
          />

          {/* Top-Right Control Action: Replay Video */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {!isVideoPlaying && (
              <button
                onClick={handleReplayClick}
                className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition-all shadow-md flex items-center gap-1.5"
                title="Replay interviewer video with audio"
              >
                <RotateCcw className="w-3 h-3 text-brand-400" />
                <span>Replay Video</span>
              </button>
            )}
          </div>

          {/* Video Playing State: Real-Time Audio Equalizer Waveform */}
          <AnimatePresence>
            {isVideoPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/90 border border-brand-400/50 backdrop-blur-md flex items-center gap-2.5 shadow-2xl z-20"
              >
                <Volume2 className="w-4 h-4 text-brand-400 animate-pulse" />
                <div className="flex items-center gap-1 h-3.5 px-1">
                  {[35, 80, 55, 100, 70, 45, 90, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-brand-500 to-cyan-300 rounded-full"
                      animate={{
                        height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`]
                      }}
                      transition={{
                        duration: 0.28,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.04
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-cyan-200 uppercase tracking-wider pl-1">
                  Interviewer Speaking (Video Audio)
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waiting for Candidate State: Microphone Listening Indicator */}
          <AnimatePresence>
            {!isVideoPlaying && isWaitingForCandidate && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-400/50 backdrop-blur-md flex items-center gap-2.5 shadow-2xl z-20"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-200 tracking-wide">
                  Interviewer listening to your response...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Architecture Specifications Trigger Badge */}
          <div className="absolute top-3 left-3 z-20">
            <button
              onClick={() => setShowSpecsModal(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/85 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-md"
              title="View Video Interview System Architecture"
            >
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>Video Interview System</span>
              <Info className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Architecture Transparency Modal */}
          <AnimatePresence>
            {showSpecsModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-4 z-30 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-y-auto text-left"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white font-display">
                        Pre-Generated Video Interview Architecture
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowSpecsModal(false)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-3 mt-3 text-xs text-slate-300 leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="font-bold text-brand-300 block mb-1">Pre-Generated Video Sequence:</span>
                      <p className="text-slate-400">
                        Realistic human interviewer video clips play in sequence. Each video plays with its original embedded audio enabled:
                      </p>
                      <ul className="list-disc list-inside text-slate-400 mt-1 space-y-0.5 text-[11px]">
                        <li><code className="text-slate-200">intro.mp4</code> — Played on entry; stops when ended to let candidate introduce themselves.</li>
                        <li><code className="text-slate-200">1st question.mp4</code> — Plays after candidate submits their introduction.</li>
                        <li><code className="text-slate-200">next-question.mp4</code> — Additional questions if placed in public folder.</li>
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="font-bold text-brand-300 block mb-1">Zero Auto-Advance Rule:</span>
                      <p className="text-slate-400">
                        Video end never advances automatically. The interviewer stops and waits for candidate spoken response. Progression occurs only when the candidate clicks "Submit & Next Question".
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="font-bold text-brand-300 block mb-1">Native Embedded Audio:</span>
                      <p className="text-slate-400">
                        Interviewer voice audio is delivered directly from the original video track without synthetic TTS or browser speech synthesis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Zero Paid 3rd-Party Dependencies
                  </span>
                  <button
                    onClick={() => setShowSpecsModal(false)}
                    className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Bottom Status Information Banner */}
      <div className="relative z-20 px-5 py-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Interactive AI Video Feed</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">1080p Synced</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-brand-300 font-medium">Pre-Generated Video Interview</span>
          </div>
        </div>
      </div>

    </div>
  );
};
