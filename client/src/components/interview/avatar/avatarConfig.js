/**
 * Modular AI Interviewer Avatar Configuration
 * 
 * ARCHITECTURE OVERVIEW:
 * 1. PRE-GENERATED VIDEO SEQUENCE LAYER:
 *    - Strict pre-generated video interview flow:
 *      * Video plays with its ORIGINAL embedded audio (video.muted = false).
 *      * Video ends -> STOPS completely (never auto-advances to next video).
 *      * Enters WAITING_FOR_CANDIDATE state.
 *      * Candidate speaks -> live transcription.
 *      * Candidate clicks "Submit & Next Question".
 *      * Checks if next video exists:
 *          YES -> advances to next video.
 *          NO -> completes interview session.
 * 2. AUDIO LAYER:
 *    - All speech audio comes strictly from the original embedded audio in each MP4.
 *    - Gemini TTS and Web Speech synthesis are disabled during this flow.
 */

export const DEFAULT_PREGENERATED_VIDEO_STEPS = [
  {
    stepIndex: 0,
    id: 'intro',
    src: '/avatars/intro.mp4',
    title: 'Interviewer Introduction & Background Overview',
    badgeText: 'Introduction',
    muted: false
  },
  {
    stepIndex: 1,
    id: 'question-1',
    src: '/avatars/1st question.mp4',
    title: 'Question 1: Technical Project & Problem Solving Experience',
    badgeText: 'Question 1',
    muted: false
  },
  {
    stepIndex: 2,
    id: 'question-2',
    src: '/avatars/next-question.mp4',
    title: 'Question 2: System Architecture, Scalability & Trade-offs',
    badgeText: 'Question 2',
    muted: false
  },
  {
    stepIndex: 3,
    id: 'question-3',
    src: '/avatars/next-question-2.mp4',
    title: 'Question 3: Edge Cases, Debugging & Production Reliability',
    badgeText: 'Question 3',
    muted: false
  },
  {
    stepIndex: 4,
    id: 'closing',
    src: '/avatars/closing.mp4',
    title: 'Closing Thoughts & Interview Wrap-Up',
    badgeText: 'Closing',
    muted: false
  }
];

/**
 * Check whether a video asset is actually available on the server
 */
export const checkVideoAssetAvailable = async (src) => {
  if (!src) return false;
  try {
    const encoded = encodeURI(decodeURI(src));
    const res = await fetch(encoded, { method: 'HEAD' });
    const cType = res.headers.get('content-type') || '';
    // Must be 200 OK and content-type must be video (not HTML SPA fallback)
    return res.ok && cType.toLowerCase().includes('video');
  } catch (err) {
    return false;
  }
};

export const DEFAULT_AVATAR_CONFIG = {
  interviewer: {
    name: 'DishaSetu AI Technical Interviewer',
    title: 'Senior Technical Interviewer & Architecture Specialist',
    organization: 'Hiring Committee & MP Online'
  },
  // Video Avatar State File Paths & Audio Configurations (Placed in client/public/avatars/)
  videoStates: {
    intro: {
      src: '/avatars/intro.mp4',
      muted: false
    },
    speaking: {
      src: '/avatars/1st%20question.mp4',
      muted: false
    },
    question1: {
      src: '/avatars/1st%20question.mp4',
      muted: false
    },
    listening: {
      src: '/avatars/listening.mp4',
      muted: true
    },
    thinking: {
      src: '/avatars/thinking.mp4',
      muted: true
    },
    closing: {
      src: '/avatars/closing.mp4',
      muted: false
    }
  },
  pregeneratedSteps: DEFAULT_PREGENERATED_VIDEO_STEPS,
  visual: {
    provider: 'video_states',
    fallbackPortraitUrl: '/avatars/elena.jpg',
    isDynamicTalkingFace: false,
    assetType: 'Pre-Generated Human Video Sequence (Original Audio Enabled)',
    badgeText: 'Pre-Generated Video Interview'
  },
  voice: {
    provider: 'embedded_video_audio',
    model: 'embedded_mp4_audio',
    geminiVoiceName: 'Aoede',
    preferredGender: 'female',
    speechRate: 1.0
  }
};

/**
 * Helper to get or override avatar configuration
 */
export const getAvatarConfig = (overrides = {}) => {
  return {
    ...DEFAULT_AVATAR_CONFIG,
    ...overrides,
    interviewer: {
      ...DEFAULT_AVATAR_CONFIG.interviewer,
      ...(overrides.interviewer || {})
    },
    videoStates: {
      ...DEFAULT_AVATAR_CONFIG.videoStates,
      ...(overrides.videoStates || {})
    },
    visual: {
      ...DEFAULT_AVATAR_CONFIG.visual,
      ...(overrides.visual || {})
    },
    voice: {
      ...DEFAULT_AVATAR_CONFIG.voice,
      ...(overrides.voice || {})
    }
  };
};
