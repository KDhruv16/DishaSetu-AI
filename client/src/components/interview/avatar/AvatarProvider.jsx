import React from 'react';
import { AvatarContext } from './AvatarContext';
import { RealtimeTalkingAvatarProvider } from './RealtimeTalkingAvatarProvider';
import { DEFAULT_AVATAR_CONFIG } from './avatarConfig';

/**
 * AvatarProvider
 * 
 * Target Architecture:
 * <AIInterviewRoom>
 *       ↓
 * <AvatarProvider>
 *       ↓
 * <RealtimeTalkingAvatarProvider>
 * 
 * Coordinates the video state avatar system:
 * {
 *   text,
 *   audio,
 *   videoState: 'intro' | 'speaking' | 'listening' | 'thinking' | 'closing',
 *   isSpeaking,
 *   isListening,
 *   isThinking,
 *   interviewerState,
 *   config,
 *   onIntroEnd,
 *   onClosingEnd
 * }
 */
export const AvatarProvider = ({
  text = '',
  audio = null,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  interviewerState = 'idle',
  videoState,
  volumeLevel = 0,
  config = DEFAULT_AVATAR_CONFIG,
  topic = 'Technical Architecture',
  onIntroEnd,
  onClosingEnd,
  questionIndex = 0,
  currentVideo = null,
  isVideoPlaying = true,
  isWaitingForCandidate = false,
  onVideoEnded = null,
  onReplay = null,
  children
}) => {
  const contextValue = {
    text,
    audio,
    isSpeaking,
    isListening,
    isThinking,
    interviewerState,
    videoState,
    volumeLevel,
    config,
    topic,
    onIntroEnd,
    onClosingEnd,
    questionIndex,
    currentVideo,
    isVideoPlaying,
    isWaitingForCandidate,
    onVideoEnded,
    onReplay
  };

  return (
    <AvatarContext.Provider value={contextValue}>
      {children || (
        <RealtimeTalkingAvatarProvider
          text={text}
          audio={audio}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          interviewerState={interviewerState}
          videoState={videoState}
          config={config}
          topic={topic}
          onIntroEnd={onIntroEnd}
          onClosingEnd={onClosingEnd}
          questionIndex={questionIndex}
          currentVideo={currentVideo}
          isVideoPlaying={isVideoPlaying}
          isWaitingForCandidate={isWaitingForCandidate}
          onVideoEnded={onVideoEnded}
          onReplay={onReplay}
        />
      )}
    </AvatarContext.Provider>
  );
};
