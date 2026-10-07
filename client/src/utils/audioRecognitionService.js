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
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.lastProcessedIndex = -1;
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

  // Backwards compatibility getter/setter for legacy references
  get accumulatedTranscript() {
    return this.finalTranscript;
  }
  set accumulatedTranscript(val) {
    this.finalTranscript = val || '';
  }

  /**
   * Check if browser supports Web Speech API
   */
  isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Retrieve current displayed transcript: final + interim
   */
  getDisplayedTranscript() {
    const cleanFinal = (this.finalTranscript || '').trim();
    const cleanInterim = (this.interimTranscript || '').trim();
    return cleanFinal && cleanInterim
      ? `${cleanFinal} ${cleanInterim}`
      : (cleanFinal || cleanInterim || '');
  }

  /**
   * Retrieve current cleaned final transcript (persisted across restarts)
   */
  getFinalTranscript() {
    return (this.finalTranscript || '').trim();
  }

  /**
   * Retrieve current interim transcript
   */
  getInterimTranscript() {
    return (this.interimTranscript || '').trim();
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

    // A fresh recognition instance starts its result-list indexing from 0.
    // Reset session-scoped index tracking and interim buffer.
    this.lastProcessedIndex = -1;
    this.interimTranscript = '';

    instance.onstart = () => {
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange({ status: 'listening', isListening: true });
      }
    };

    instance.onresult = (event) => {
      if (!event.results) return;

      const newFinalChunks = [];

      // 1. Process ONLY newly finalized results starting from event.resultIndex
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (!result || !result[0]) continue;

        if (result.isFinal) {
          // Never append the same final result index twice within this recognition session
          if (i > this.lastProcessedIndex) {
            this.lastProcessedIndex = i;
            const text = result[0].transcript ? result[0].transcript.trim() : '';
            if (text) {
              newFinalChunks.push(text);
            }
          }
        }
      }

      // 2. Only append NEW finalized speech to the persistent final transcript
      if (newFinalChunks.length > 0) {
        const addedFinal = newFinalChunks.join(' ');
        this.finalTranscript = this.finalTranscript
          ? `${this.finalTranscript} ${addedFinal}`
          : addedFinal;
      }

      // 3. Rebuild the current interim transcript freshly from non-final results in this event
      let currentInterim = '';
      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result && result[0] && !result.isFinal) {
          const text = result[0].transcript ? result[0].transcript.trim() : '';
          if (text) {
            currentInterim += (currentInterim ? ' ' : '') + text;
          }
        }
      }
      this.interimTranscript = currentInterim;

      // 4. Construct clean displayed transcript = finalTranscript + interimTranscript
      const cleanFinal = (this.finalTranscript || '').trim();
      const cleanInterim = (this.interimTranscript || '').trim();
      const displayedTranscript = cleanFinal && cleanInterim
        ? `${cleanFinal} ${cleanInterim}`
        : (cleanFinal || cleanInterim || '');

      // 5. Notify listeners with separated and combined fields
      if (this.callbacks.onTranscript) {
        this.callbacks.onTranscript({
          displayedTranscript,
          currentSpokenText: displayedTranscript,
          finalTranscript: cleanFinal,
          finalText: cleanFinal,
          interimTranscript: cleanInterim,
          interim: cleanInterim
        });
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
      // Clear interim transcript on session boundary to avoid ghost interim speech
      this.interimTranscript = '';

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

    if (initialText !== undefined && initialText !== null) {
      this.finalTranscript = initialText.trim();
    }
    this.interimTranscript = '';
    this.lastProcessedIndex = -1;

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

    this.interimTranscript = '';

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({ status: 'idle', isListening: false });
    }
  }

  /**
   * Reset the transcript buffer and cleanly restart if recognition is active
   */
  clearTranscript() {
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.lastProcessedIndex = -1;

    if (this.callbacks.onTranscript) {
      this.callbacks.onTranscript({
        displayedTranscript: '',
        currentSpokenText: '',
        finalTranscript: '',
        finalText: '',
        interimTranscript: '',
        interim: ''
      });
    }

    if (this.isListening) {
      clearTimeout(this.restartTimeout);
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (_) {}
      }
      this.restartTimeout = setTimeout(() => {
        if (!this.isListening) return;
        try {
          this.recognition = this._createRecognition();
          if (this.recognition) {
            this.recognition.start();
          }
        } catch (err) {
          console.warn('[AudioRecognitionService] Restart on clear warning:', err.message);
        }
      }, 100);
    }
  }

  /**
   * Set or update base transcript manually (e.g. if user types in correction)
   */
  setTranscript(text = '') {
    this.finalTranscript = (text || '').trim();
    this.interimTranscript = '';
    this.lastProcessedIndex = -1;
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
