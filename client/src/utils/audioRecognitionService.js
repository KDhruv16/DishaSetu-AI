/**
 * Real-Time Audio Recognition and Microphone Input Service
 * 
 * Captures candidate voice via browser microphone, transcribes speech
 * in real-time using Web Speech API with automatic silence-recovery,
 * permission monitoring, and volume level analysis.
 */

class AudioRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.restartTimeout = null;
    this.accumulatedTranscript = '';
    this.callbacks = {
      onTranscript: null,
      onError: null,
      onStateChange: null
    };

    // Audio volume analysis members
    this.audioContext = null;
    this.analyser = null;
    this.micStream = null;
    this.volumeCallback = null;
    this.volumeAnimationId = null;
  }

  /**
   * Check if browser supports Web Speech API
   */
  isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Helper to instantiate a clean SpeechRecognition instance
   */
  _createRecognition() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.continuous = true;
    instance.interimResults = true;
    instance.maxAlternatives = 1;
    instance.lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';

    instance.onstart = () => {
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange({ status: 'listening', isListening: true });
      }
    };

    instance.onresult = (event) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        const text = res[0]?.transcript || '';
        if (res.isFinal) {
          sessionFinal += (sessionFinal ? ' ' : '') + text.trim();
        } else {
          sessionInterim += (sessionInterim ? ' ' : '') + text.trim();
        }
      }

      // Combine previous accumulated transcript with current session text
      const parts = [];
      if (this.accumulatedTranscript) parts.push(this.accumulatedTranscript);
      if (sessionFinal) parts.push(sessionFinal);
      if (sessionInterim) parts.push(sessionInterim);

      const currentSpokenText = parts.join(' ').trim();

      if (this.callbacks.onTranscript) {
        this.callbacks.onTranscript({
          currentSpokenText,
          interim: sessionInterim,
          finalText: [this.accumulatedTranscript, sessionFinal].filter(Boolean).join(' ').trim()
        });
      }

      // If we got finalized text in this session, save it into accumulatedTranscript
      if (sessionFinal && event.results[event.results.length - 1]?.isFinal) {
        this.accumulatedTranscript = [this.accumulatedTranscript, sessionFinal].filter(Boolean).join(' ').trim();
      }
    };

    instance.onerror = (event) => {
      const errType = event.error;

      // 'no-speech' is a normal browser silence timeout, do not treat as fatal error
      if (errType === 'no-speech') {
        return;
      }

      // User blocked microphone or browser policy denied access
      if (errType === 'not-allowed' || errType === 'service-not-allowed') {
        this.isListening = false;
        if (this.callbacks.onError) {
          this.callbacks.onError({
            type: 'permission-denied',
            message: 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
          });
        }
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange({ status: 'error', isListening: false, error: 'permission-denied' });
        }
        return;
      }

      if (errType === 'network') {
        console.warn('[AudioRecognitionService] Web Speech network notice:', event.message || 'Network unreachable');
        // Will attempt auto-restart on 'onend'
        return;
      }

      if (errType === 'aborted') {
        // Recognition aborted intentionally
        return;
      }

      console.warn('[AudioRecognitionService] Recognition event error:', errType);
      if (this.callbacks.onError) {
        this.callbacks.onError({ type: errType, message: event.message || `Speech recognition error: ${errType}` });
      }
    };

    instance.onend = () => {
      // If we are still marked as active listening, restart with a small debounce to prevent InvalidStateError
      if (this.isListening) {
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange({ status: 'restarting', isListening: true });
        }

        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => {
          if (!this.isListening) return;
          try {
            // Re-instantiate recognition to ensure clean state across browser restarts
            this.recognition = this._createRecognition();
            if (this.recognition) {
              this.recognition.start();
            }
          } catch (restartErr) {
            console.warn('[AudioRecognitionService] Restart warning:', restartErr.message);
            // Retry once more after brief delay
            this.restartTimeout = setTimeout(() => {
              if (this.isListening && this.recognition) {
                try { this.recognition.start(); } catch (_) { /* ignore */ }
              }
            }, 500);
          }
        }, 150);
      } else {
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange({ status: 'idle', isListening: false });
        }
      }
    };

    return instance;
  }

  /**
   * Start microphone speech recognition
   */
  startListening({ onTranscript, onError, onStateChange, initialText = '' } = {}) {
    if (!this.isSupported()) {
      const err = {
        type: 'unsupported',
        message: 'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      };
      if (onError) onError(err);
      if (onStateChange) onStateChange({ status: 'unsupported', isListening: false, error: 'unsupported' });
      return;
    }

    this.callbacks.onTranscript = onTranscript;
    this.callbacks.onError = onError;
    this.callbacks.onStateChange = onStateChange;

    if (initialText) {
      this.accumulatedTranscript = initialText.trim();
    }

    if (this.isListening) {
      return;
    }

    this.isListening = true;
    clearTimeout(this.restartTimeout);

    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch (_) {}
      }
      this.recognition = this._createRecognition();
      if (this.recognition) {
        this.recognition.start();
      }
    } catch (err) {
      console.warn('[AudioRecognitionService] start error:', err);
      this.isListening = false;
      if (onError) onError({ type: 'start-failed', message: err.message });
      if (onStateChange) onStateChange({ status: 'error', isListening: false });
    }
  }

  /**
   * Stop speech recognition
   */
  stopListening() {
    this.isListening = false;
    clearTimeout(this.restartTimeout);

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        try { this.recognition.abort(); } catch (_) {}
      }
    }

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({ status: 'idle', isListening: false });
    }
  }

  /**
   * Reset the transcript buffer
   */
  clearTranscript() {
    this.accumulatedTranscript = '';
  }

  /**
   * Set or update base transcript manually (e.g. if user types in correction)
   */
  setTranscript(text = '') {
    this.accumulatedTranscript = text.trim();
  }

  /**
   * Monitor microphone audio volume levels for live UI visualization
   */
  async startVolumeMeter(stream, onVolumeUpdate) {
    this.micStream = stream;
    this.volumeCallback = onVolumeUpdate;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !stream) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Check if stream has audio tracks
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0 || !audioTracks[0].enabled) {
        return;
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const tick = () => {
        if (!this.analyser || !this.volumeCallback) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));

        this.volumeCallback(normalizedVolume);
        this.volumeAnimationId = requestAnimationFrame(tick);
      };

      tick();
    } catch (err) {
      console.warn('[AudioRecognitionService] Volume meter error:', err);
    }
  }

  stopVolumeMeter() {
    if (this.volumeAnimationId) {
      cancelAnimationFrame(this.volumeAnimationId);
      this.volumeAnimationId = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.volumeCallback = null;
  }
}

export const audioRecognitionService = new AudioRecognitionService();
