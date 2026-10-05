import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Building2,
  Clock,
  Send,
  Loader2,
  Subtitles,
  Cpu,
  Trash2,
  Play
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { speechService } from '../utils/speechService';
import { audioRecognitionService } from '../utils/audioRecognitionService';
import { AvatarRenderer } from '../components/interview/AvatarRenderer';
import { CandidateVideoTile } from '../components/interview/CandidateVideoTile';
import {
  DEFAULT_AVATAR_CONFIG,
  DEFAULT_PREGENERATED_VIDEO_STEPS,
  checkVideoAssetAvailable
} from '../components/interview/avatar/avatarConfig';

/**
 * AiInterviewRoomPage
 * 
 * Strict Pre-Generated Video Interview Architecture:
 * 1. VIDEO 1 (intro.mp4):
 *    - Plays with ORIGINAL embedded audio (video.muted = false).
 *    - When video reaches the end -> STOPS on final frame.
 *    - NEVER automatically starts next video.
 *    - NEVER invokes Gemini question generation or TTS.
 *    - Enters WAITING_FOR_CANDIDATE state.
 *    - Candidate speaks (live real-time transcript).
 * 2. Candidate clicks "Submit & Next Question":
 *    - Saves candidate response.
 *    - Checks if next video exists.
 * 3. VIDEO 2 (1st question.mp4):
 *    - Plays with ORIGINAL embedded audio.
 *    - When video finishes -> STOPS.
 *    - Enters WAITING_FOR_CANDIDATE state.
 *    - Candidate answers -> clicks "Submit & Next Question".
 * 4. SEQUENCE CONTINUATION:
 *    - Checks if next video exists in configurable list.
 *    - YES -> plays next video.
 *    - NO -> completes interview session, shows "AI Interview Completed" screen.
 */
export const AiInterviewRoomPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Session & Interview Data
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Avatar Configuration
  const [avatarConfig, setAvatarConfig] = useState(DEFAULT_AVATAR_CONFIG);

  // Local Media Stream & Permissions
  const [localStream, setLocalStream] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Pre-Generated Video Sequence Flow State
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [availableSteps, setAvailableSteps] = useState(DEFAULT_PREGENERATED_VIDEO_STEPS);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isWaitingForCandidate, setIsWaitingForCandidate] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active step object
  const currentStep = availableSteps[currentStepIdx] || DEFAULT_PREGENERATED_VIDEO_STEPS[currentStepIdx] || DEFAULT_PREGENERATED_VIDEO_STEPS[0];

  // Interview timer
  useEffect(() => {
    if (loading || interviewComplete) return;
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, interviewComplete]);

  // Format timer
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Initialize Interview Session & Media Stream
  useEffect(() => {
    let streamRef = null;

    const initInterview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch AI interview session
        const res = await api.get(`/ai-interview/session/${interviewId}`);
        if (res.data?.success) {
          const data = res.data.data;
          setSessionData(data);

          if (data.status === 'completed' || data.aiSession?.completedAt) {
            setInterviewComplete(true);
          }
        } else {
          setError('Failed to load AI interview session.');
        }

        // Discover which pre-generated videos are available on the server
        const available = [];
        for (const step of DEFAULT_PREGENERATED_VIDEO_STEPS) {
          const isAvail = await checkVideoAssetAvailable(step.src);
          if (isAvail) {
            available.push(step);
          }
        }
        if (available.length > 0) {
          setAvailableSteps(available);
        }

        // Initialize User Camera & Microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
          });
          streamRef = stream;
          setLocalStream(stream);
          setMicPermissionDenied(false);

          // Start volume level analyzer
          audioRecognitionService.startVolumeMeter(stream, (vol) => {
            setVolumeLevel(vol);
          });
        } catch (mediaErr) {
          console.warn('[AI Interview Room] Camera/mic access warning:', mediaErr.message);
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            setMicPermissionDenied(true);
          }
        }
      } catch (err) {
        console.error('initInterview error:', err);
        setError(err.response?.data?.message || 'Error initializing AI interview room');
      } finally {
        setLoading(false);
        setIsVideoPlaying(true);
        setIsWaitingForCandidate(false);
      }
    };

    initInterview();

    return () => {
      speechService.stop();
      audioRecognitionService.stopListening();
      audioRecognitionService.stopVolumeMeter();
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
    };
  }, [interviewId]);

  // Request or re-trigger microphone permission
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: !isVideoOff });
      setLocalStream(stream);
      setMicPermissionDenied(false);
      audioRecognitionService.startVolumeMeter(stream, (vol) => setVolumeLevel(vol));
      if (!isVideoPlaying && !isThinking) {
        startListeningCandidate();
      }
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      alert('Microphone access was blocked. Please check your browser address bar permissions icon to allow microphone access.');
    }
  };

  // ========================================
  // PRE-GENERATED VIDEO INTERVIEW FLOW LOGIC
  // ========================================

  /**
   * Handle completion of the currently playing video.
   * CRITICAL RULES:
   * - Video ends -> STOP.
   * - DO NOT automatically start another video.
   * - DO NOT generate a Gemini question.
   * - DO NOT play Gemini TTS.
   * - DO NOT automatically move to the next question.
   * - Enter WAITING_FOR_CANDIDATE state.
   * - Candidate now gives their answer.
   */
  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setIsWaitingForCandidate(true);
    if (!isMicMuted) {
      startListeningCandidate();
    }
  };

  /**
   * Replay current video with its original embedded audio
   */
  const handleReplayVideo = () => {
    stopListeningCandidate();
    setIsWaitingForCandidate(false);
    setIsVideoPlaying(true);
  };

  /**
   * Start candidate microphone recognition
   */
  const startListeningCandidate = () => {
    if (interviewComplete || isVideoPlaying || isThinking || isMicMuted) return;

    audioRecognitionService.startListening({
      initialText: currentAnswer,
      onTranscript: ({ currentSpokenText }) => {
        setCurrentAnswer(currentSpokenText);
      },
      onError: (err) => {
        console.warn('[AI Interview Room] Speech recognition notice:', err);
        if (err.type === 'permission-denied') {
          setMicPermissionDenied(true);
        }
      },
      onStateChange: ({ isListening: listeningActive, error: stateErr }) => {
        setIsListening(listeningActive);
        if (stateErr === 'permission-denied') {
          setMicPermissionDenied(true);
        }
      }
    });
  };

  /**
   * Stop listening
   */
  const stopListeningCandidate = () => {
    setIsListening(false);
    audioRecognitionService.stopListening();
  };

  /**
   * Toggle dictation
   */
  const toggleListeningCandidate = () => {
    if (isListening) {
      stopListeningCandidate();
    } else {
      if (isVideoPlaying) return;
      startListeningCandidate();
    }
  };

  /**
   * Clear transcribed answer
   */
  const handleClearAnswer = () => {
    setCurrentAnswer('');
    audioRecognitionService.clearTranscript();
  };

  /**
   * Candidate clicks "Submit & Next Question"
   * THE ONLY EVENT THAT ADVANCES FROM ONE VIDEO TO THE NEXT.
   * 
   * Flow:
   * 1. Save candidate response for current step.
   * 2. Check whether another video exists.
   *    YES -> play next video (with original embedded audio).
   *    NO  -> candidate submitted final response -> complete the interview.
   */
  const handleSubmitAndNext = async () => {
    if (isVideoPlaying || isThinking) return;

    if (!currentAnswer.trim() && !confirm('Submit without spoken answer?')) {
      return;
    }

    try {
      stopListeningCandidate();
      setIsThinking(true);

      const candidateSpokenText = currentAnswer.trim();

      // Record answer locally
      const updatedAnswers = [
        ...recordedAnswers,
        {
          stepIndex: currentStepIdx,
          videoId: currentStep.id,
          videoSrc: currentStep.src,
          title: currentStep.title,
          candidateResponse: candidateSpokenText,
          timestamp: new Date().toISOString()
        }
      ];
      setRecordedAnswers(updatedAnswers);

      // Persist candidate response to backend session
      try {
        await api.post('/ai-interview/next-question', {
          interviewId,
          candidateResponse: candidateSpokenText,
          currentQuestionIndex: currentStepIdx,
          stepTitle: currentStep.title
        });
      } catch (syncErr) {
        console.debug('[AI Interview Room] Backend sync notice:', syncErr.message);
      }

      // Reset candidate answer box for next question
      setCurrentAnswer('');
      audioRecognitionService.clearTranscript();

      // Check whether another video exists in the configurable sequence
      const nextIdx = currentStepIdx + 1;
      const nextStep = DEFAULT_PREGENERATED_VIDEO_STEPS[nextIdx];
      const hasNextVideo = nextStep ? await checkVideoAssetAvailable(nextStep.src) : false;

      if (hasNextVideo) {
        // YES -> Advance to next video
        setCurrentStepIdx(nextIdx);
        setIsWaitingForCandidate(false);
        setIsVideoPlaying(true);
      } else {
        // NO -> Final video finished and candidate submitted answer! Complete interview.
        try {
          await api.post('/ai-interview/end', { interviewId });
        } catch (endErr) {
          console.warn('[AI Interview Room] End interview notice:', endErr.message);
        }
        setInterviewComplete(true);
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Failed to process response. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  // Controls: Mic Mute / Unmute
  const toggleMic = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    if (!isMicMuted) {
      stopListeningCandidate();
      setIsMicMuted(true);
    } else {
      setIsMicMuted(false);
      if (!isVideoPlaying && !isThinking) {
        startListeningCandidate();
      }
    }
  };

  // Controls: Video On / Off
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // Conclude / End Interview manually
  const handleEndInterview = async () => {
    try {
      setIsThinking(true);
      stopListeningCandidate();
      await api.post('/ai-interview/end', { interviewId });
      setInterviewComplete(true);
      setShowEndModal(false);
    } catch (err) {
      console.error('Failed to end interview:', err);
      setInterviewComplete(true);
      setShowEndModal(false);
    } finally {
      setIsThinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display">Entering AI Interview Room...</h2>
        <p className="text-slate-400 text-sm mt-1">Initializing AI Interviewer & Pre-Generated Video Stream</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Unable to Join Interview</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'Session could not be located.'}</p>
          <button
            onClick={() => navigate('/recruitment-interviews')}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const { opportunity = {}, organization = {}, candidate = {} } = sessionData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden">
      
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white font-display">
                {opportunity.title || 'Technical Role'}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI Video Interview
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {organization.name || opportunity.company || 'Hiring Company'}
            </p>
          </div>
        </div>

        {/* Center: Live Timer & Progress */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-xs text-slate-400">Progress:</span>
            <span className="text-xs font-bold text-white">
              {currentStepIdx === 0 ? 'Introduction' : `Question ${currentStepIdx}`} • Step {currentStepIdx + 1} of {Math.max(availableSteps.length, currentStepIdx + 1)}
            </span>
          </div>
        </div>

        {/* Right: End Call Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEndModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Interview</span>
          </button>
        </div>
      </header>

      {/* Main Video Conference Stage */}
      <main className="flex-1 p-3 sm:p-5 flex flex-col gap-4 overflow-hidden relative">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          
          {/* Main Interviewer Avatar Viewport (Takes 2 Columns on desktop) */}
          <div className="lg:col-span-2 relative h-full flex flex-col">
            <AvatarRenderer
              currentVideo={currentStep}
              isVideoPlaying={isVideoPlaying}
              isWaitingForCandidate={isWaitingForCandidate}
              onVideoEnded={handleVideoEnded}
              onReplay={handleReplayVideo}
              videoState={isVideoPlaying ? 'speaking' : isWaitingForCandidate ? 'listening' : 'idle'}
              isSpeaking={isVideoPlaying}
              isListening={isListening}
              isThinking={isThinking}
              interviewerState={isVideoPlaying ? 'speaking' : 'idle'}
              avatarConfig={avatarConfig}
              currentQuestionTopic={currentStep?.title || 'Technical Interview'}
              currentQuestionText={currentStep?.title || ''}
              audio={null}
              volumeLevel={volumeLevel}
              questionIndex={currentStepIdx}
            />

            {/* Live Question Floating Card Overlay */}
            {currentStep && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={currentStep.id}
                className="absolute top-16 left-4 right-4 z-20 pointer-events-auto"
              >
                <div className="bg-slate-900/90 backdrop-blur-md border border-brand-500/30 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {currentStep.badgeText} • Step {currentStepIdx + 1} of {Math.max(availableSteps.length, currentStepIdx + 1)}
                    </span>
                    <button
                      onClick={handleReplayVideo}
                      disabled={isVideoPlaying}
                      className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                      title="Replay video with original audio"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Replay Video
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                    {currentStep.title}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Candidate Webcam & Live Response Interaction */}
          <div className="flex flex-col gap-4 h-full">
            
            {/* Candidate Webcam Feed Tile */}
            <div className="h-48 sm:h-56 lg:h-64 shrink-0">
              <CandidateVideoTile
                stream={localStream}
                candidateName={candidate.name || 'Candidate'}
                isMicMuted={isMicMuted}
                isVideoOff={isVideoOff}
                volumeLevel={volumeLevel}
                isListening={isListening}
              />
            </div>

            {/* Candidate Spoken Response & Live Subtitles Bar */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl min-h-[200px]">
              <div>
                
                {/* Header with real-time mic indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      isListening 
                        ? 'bg-emerald-400 animate-pulse' 
                        : isVideoPlaying 
                        ? 'bg-amber-400' 
                        : isThinking 
                        ? 'bg-purple-400 animate-pulse' 
                        : 'bg-slate-500'
                    }`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Your Spoken Answer
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isListening ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Transcribing Live
                      </span>
                    ) : (
                      <button
                        onClick={toggleListeningCandidate}
                        disabled={isThinking || isVideoPlaying}
                        className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors disabled:opacity-40"
                      >
                        <Mic className="w-3 h-3" />
                        {currentAnswer ? 'Resume Dictation' : 'Start Speaking'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Microphone Permission Alert */}
                {micPermissionDenied && (
                  <div className="mb-2 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Mic access blocked by browser
                    </span>
                    <button
                      onClick={requestMicPermission}
                      className="px-2 py-0.5 bg-amber-500 text-black font-bold text-[10px] rounded hover:bg-amber-400 transition-colors"
                    >
                      Enable Mic
                    </button>
                  </div>
                )}

                {/* Real-time transcribed text display & editable area */}
                <div className="relative min-h-[90px] max-h-[160px] p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-sm leading-relaxed text-slate-200 flex flex-col justify-between">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => {
                      setCurrentAnswer(e.target.value);
                      audioRecognitionService.setTranscript(e.target.value);
                    }}
                    placeholder={
                      isVideoPlaying
                        ? 'Please watch and listen to the interviewer... when the video ends, you can give your answer.'
                        : isListening
                        ? 'Listening to your microphone... speak now, your words will transcribe here in real-time.'
                        : isThinking
                        ? 'Submitting response...'
                        : 'Click "Start Speaking" or begin talking into your microphone to answer.'
                    }
                    className="w-full h-full bg-transparent resize-none border-none outline-none text-slate-200 placeholder-slate-500 text-sm leading-relaxed"
                    rows={4}
                  />

                  {/* Dictation toolbar inside text container */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleListeningCandidate}
                        disabled={isThinking || isVideoPlaying}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          isListening 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
                        }`}
                        title={isListening ? 'Pause listening' : 'Start speaking'}
                      >
                        {isListening ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Listening Active
                          </>
                        ) : (
                          <>
                            <Mic className="w-2.5 h-2.5" />
                            Mic Inactive
                          </>
                        )}
                      </button>

                      {currentAnswer && (
                        <button
                          onClick={handleClearAnswer}
                          className="text-slate-500 hover:text-rose-400 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                          title="Clear transcript"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Clear
                        </button>
                      )}
                    </div>

                    <span>
                      {currentAnswer.trim() ? `${currentAnswer.trim().split(/\s+/).length} words spoken` : '0 words'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action buttons to complete answer or manual edit */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  {isVideoPlaying ? (
                    <span className="text-amber-400 font-medium">Interviewer speaking</span>
                  ) : currentAnswer.trim() ? (
                    <span className="text-emerald-400 font-medium">Ready to submit</span>
                  ) : (
                    <span>Speak into microphone</span>
                  )}
                </div>

                <button
                  onClick={handleSubmitAndNext}
                  disabled={isThinking || isVideoPlaying}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-brand-500/25 active:scale-95 disabled:opacity-50"
                >
                  {isThinking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Response...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit & Next Question
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Live Closed Captions Bottom Banner */}
        {showCaptions && currentStep && (
          <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-center text-xs text-slate-300 max-w-4xl mx-auto w-full truncate">
            <span className="text-brand-400 font-bold mr-2">CC:</span>
            {isVideoPlaying ? currentStep.title : currentAnswer || 'Candidate Turn: Speak into your microphone...'}
          </div>
        )}
      </main>

      {/* Bottom Meeting Control Bar */}
      <footer className="h-18 px-6 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-xl flex items-center justify-center gap-4 shrink-0 z-30">
        
        {/* Microphone Toggle */}
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition-all ${
            isMicMuted 
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
          }`}
          title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-2xl border transition-all ${
            isVideoOff 
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
              : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
          }`}
          title={isVideoOff ? 'Start Video' : 'Stop Video'}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Closed Captions Toggle */}
        <button
          onClick={() => setShowCaptions(!showCaptions)}
          className={`p-3.5 rounded-2xl border transition-all ${
            showCaptions 
              ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
          title="Toggle Captions"
        >
          <Subtitles className="w-5 h-5" />
        </button>

        {/* Replay Video */}
        <button
          onClick={handleReplayVideo}
          disabled={isVideoPlaying || isThinking}
          className="p-3.5 rounded-2xl border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          title="Replay Video with Audio"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* End Interview */}
        <button
          onClick={() => setShowEndModal(true)}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/40 transition-all shadow-lg active:scale-95 ml-4"
          title="Leave & Complete Interview"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </footer>

      {/* Confirmation Modal to End Interview */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <PhoneOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">End AI Interview Session?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Your recorded answers up to {currentStepIdx === 0 ? 'Introduction' : `Question ${currentStepIdx}`} will be submitted to the {organization.name || 'organization'} recruitment team.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-sm transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={handleEndInterview}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md"
              >
                Yes, End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Concluded / Thank You Screen */}
      {interviewComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-brand-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Session Complete
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-3">
                AI Interview Completed
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Thank you, {candidate.name || user?.name || 'Candidate'}! Your interview responses for <strong className="text-white">{opportunity.title}</strong> at <strong className="text-white">{organization.name || opportunity.company}</strong> have been recorded successfully.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Duration</span>
                <p className="text-sm font-bold text-white">{formatTime(elapsedSeconds)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Questions Answered</span>
                <p className="text-sm font-bold text-white">
                  {recordedAnswers.length || Math.max(currentStepIdx + 1, 1)} / {Math.max(availableSteps.length, 2)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              The hiring team has been notified. You can check the status of your application from your candidate dashboard.
            </p>

            <button
              onClick={() => navigate('/opportunities')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              Return to Applications
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};
