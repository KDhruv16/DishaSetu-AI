import React from 'react';
import { AvatarProvider } from './avatar/AvatarProvider';
import { DEFAULT_AVATAR_CONFIG } from './avatar/avatarConfig';

/**
 * AvatarRenderer Component
 * 
 * Target Architecture:
 * <AIInterviewRoom>
 *       ↓
 * <AvatarProvider>
 *       ↓
 * <RealtimeTalkingAvatarProvider>
 * 
 * Renders the realistic talking AI interviewer video presentation layer,
 * receiving text, audio, videoState, speaking state, and interviewer state.
 */
export const AvatarRenderer = ({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  interviewerState,
  videoState,
  avatarConfig = DEFAULT_AVATAR_CONFIG,
  currentQuestionTopic = 'Technical Architecture',
  currentQuestionText = '',
  audio = null,
  volumeLevel = 0,
  onIntroEnd,
  onClosingEnd,
  questionIndex = 0,
  currentVideo = null,
  isVideoPlaying = true,
  isWaitingForCandidate = false,
  onVideoEnded = null,
  onReplay = null
}) => {
  return (
    <AvatarProvider
      text={currentQuestionText}
      audio={audio}
      isSpeaking={isSpeaking}
      isListening={isListening}
      isThinking={isThinking}
      interviewerState={interviewerState}
      videoState={videoState}
      volumeLevel={volumeLevel}
      config={avatarConfig}
      topic={currentQuestionTopic}
      onIntroEnd={onIntroEnd}
      onClosingEnd={onClosingEnd}
      questionIndex={questionIndex}
      currentVideo={currentVideo}
      isVideoPlaying={isVideoPlaying}
      isWaitingForCandidate={isWaitingForCandidate}
      onVideoEnded={onVideoEnded}
      onReplay={onReplay}
    />
  );
};
