import React, { createContext, useContext } from 'react';

/**
 * AvatarContext
 * Exposes the interviewer avatar's state, configuration, and playback events.
 */
export const AvatarContext = createContext({
  interviewerState: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  isSpeaking: false,
  isListening: false,
  isThinking: false,
  text: '',
  audio: null,
  volumeLevel: 0,
  config: {}
});

export const useAvatar = () => useContext(AvatarContext);
