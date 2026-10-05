import api from './api';

/**
 * Speech Synthesis & Gemini Audio Service for AI Interviewer Avatar
 * 
 * Target Architecture:
 * 1. Primary Engine: Google Gemini 3.8 Flash TTS ('gemini-3.8-flash-tts' with prebuilt voice 'Aoede')
 * 2. Web Audio API Pipeline: Uses AudioContext and AudioBufferSourceNode for 100% reliable low-latency audio playback.
 * 3. Base64 & WAV / PCM Decoding: Decodes Gemini base64 audio and handles standard RIFF WAV as well as raw PCM.
 * 4. Autoplay Policy Recovery: Automatically resumes suspended AudioContext on first user interaction without dropping audio.
 * 5. Audio Isolation: Video elements stay strictly muted; Gemini TTS routes through AudioContext to system speakers.
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.audioCtx = null;
    this.currentSourceNode = null;
    this.currentGainNode = null;
    this.currentAudioElement = null;
    this.audioTimeout = null;
    this.voices = [];
    this.isSpeaking = false;
    this.onVisemeCallback = null;
    this.onStateChangeCallback = null;
    this._pendingPlayback = null;
    this._gestureUnlocked = false;

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }

    if (typeof window !== 'undefined') {
      this._setupGestureUnlock();
    }
  }

  /**
   * Lazily initialize or retrieve AudioContext
   */
  getAudioContext() {
    if (this.audioCtx || typeof window === 'undefined') return this.audioCtx;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.warn('[Gemini TTS] AudioContext initialization notice:', e);
    }
    return this.audioCtx;
  }

  /**
   * Set up global listeners to resume suspended AudioContext on user interaction
   */
  _setupGestureUnlock() {
    if (typeof window === 'undefined' || this._gestureListenerAttached) return;
    this._gestureListenerAttached = true;

    const unlock = () => {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          console.log('[Gemini TTS] AudioContext state after user interaction:', ctx.state);
          this._gestureUnlocked = true;
          if (this._pendingPlayback) {
            const pending = this._pendingPlayback;
            this._pendingPlayback = null;
            this.playGeminiAudio(pending.audioObj, pending.options);
          }
        }).catch(err => {
          console.warn('[Gemini TTS] playback error on resume:', err);
        });
      } else if (ctx && ctx.state === 'running') {
        this._gestureUnlocked = true;
      }
    };

    ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: false, passive: true });
    });
  }

  /**
   * Explicitly resume AudioContext (e.g. on entering room or clicking buttons)
   */
  resumeAudioContext() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      return ctx.resume().then(() => {
        console.log('[Gemini TTS] AudioContext state:', ctx.state);
        this._gestureUnlocked = true;
        if (this._pendingPlayback) {
          const pending = this._pendingPlayback;
          this._pendingPlayback = null;
          this.playGeminiAudio(pending.audioObj, pending.options);
        }
      });
    }
    return Promise.resolve();
  }

  loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
    } catch (_) {
      this.voices = [];
    }
  }

  getBestVoice(preferredGender = 'female') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }

    const englishVoices = this.voices.filter(v => v.lang && v.lang.startsWith('en'));

    if (preferredGender === 'female') {
      const preferred = englishVoices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Zira')) &&
        !v.name.includes('Male') && !v.name.includes('Guy') && !v.name.includes('David')
      );
      if (preferred) return preferred;
    } else {
      const preferredMale = englishVoices.find(v =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Guy') || v.name.includes('Christopher') || v.name.includes('David'))
      );
      if (preferredMale) return preferredMale;
    }

    return englishVoices.find(v => v.name.includes('Google')) || englishVoices[0] || this.voices[0] || null;
  }

  /**
   * Convert base64 string to Uint8Array
   */
  _base64ToUint8Array(base64) {
    const clean = base64.replace(/[\r\n\s]/g, '');
    const binary = window.atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Ensure PCM buffer is wrapped in a standard 44-byte RIFF WAV header
   */
  _pcmToWavArrayBuffer(pcmBytes, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
    if (pcmBytes.byteLength >= 4 &&
        String.fromCharCode(pcmBytes[0], pcmBytes[1], pcmBytes[2], pcmBytes[3]) === 'RIFF') {
      return pcmBytes.buffer.slice(pcmBytes.byteOffset, pcmBytes.byteOffset + pcmBytes.byteLength);
    }

    const dataSize = pcmBytes.byteLength;
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF chunk descriptor
    view.setUint8(0, 'R'.charCodeAt(0));
    view.setUint8(1, 'I'.charCodeAt(0));
    view.setUint8(2, 'F'.charCodeAt(0));
    view.setUint8(3, 'F'.charCodeAt(0));
    view.setUint32(4, 36 + dataSize, true);
    view.setUint8(8, 'W'.charCodeAt(0));
    view.setUint8(9, 'A'.charCodeAt(0));
    view.setUint8(10, 'V'.charCodeAt(0));
    view.setUint8(11, 'E'.charCodeAt(0));

    // "fmt " sub-chunk
    view.setUint8(12, 'f'.charCodeAt(0));
    view.setUint8(13, 'm'.charCodeAt(0));
    view.setUint8(14, 't'.charCodeAt(0));
    view.setUint8(15, ' '.charCodeAt(0));
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    view.setUint8(36, 'd'.charCodeAt(0));
    view.setUint8(37, 'a'.charCodeAt(0));
    view.setUint8(38, 't'.charCodeAt(0));
    view.setUint8(39, 'a'.charCodeAt(0));
    view.setUint32(40, dataSize, true);

    const wavBytes = new Uint8Array(44 + dataSize);
    wavBytes.set(new Uint8Array(header), 0);
    wavBytes.set(pcmBytes, 44);
    return wavBytes.buffer;
  }

  /**
   * Manually construct an AudioBuffer from 16-bit linear PCM samples
   */
  _rawPcmToAudioBuffer(ctx, pcmBytes, sampleRate = 24000) {
    const numSamples = Math.floor(pcmBytes.byteLength / 2);
    const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const dataView = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);

    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true); // little-endian
      channelData[i] = int16 / 32768.0;
    }
    return audioBuffer;
  }

  /**
   * Directly play a pre-synthesized Gemini audio object ({ audioBase64, mimeType })
   * Decodes via Web Audio API AudioContext for crystal-clear, zero-lag playback.
   */
  async playGeminiAudio(audioObj, { onStart, onEnd } = {}) {
    if (!audioObj || !audioObj.audioBase64) {
      console.warn('[Gemini TTS] No audioBase64 received in playGeminiAudio');
      if (onEnd) onEnd();
      return false;
    }

    console.log('[Gemini TTS] audio received');
    const base64Len = audioObj.audioBase64.length;
    console.log('[Gemini TTS] base64 length:', base64Len);

    this.stop();

    try {
      // 1. Decode base64 to binary bytes
      const rawBytes = this._base64ToUint8Array(audioObj.audioBase64);
      console.log('[Gemini TTS] decoded audio bytes:', rawBytes.byteLength);

      // 2. Ensure AudioContext is ready
      const ctx = this.getAudioContext();
      if (!ctx) {
        console.warn('[Gemini TTS] AudioContext not available, falling back to HTMLAudioElement');
        return this._playViaAudioElement(rawBytes, audioObj.mimeType || 'audio/wav', { onStart, onEnd });
      }

      console.log('[Gemini TTS] AudioContext state:', ctx.state);

      // Check if suspended by browser autoplay policy
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
          console.log('[Gemini TTS] AudioContext state:', ctx.state);
        } catch (resumeErr) {
          console.warn('[Gemini TTS] AudioContext resume deferred (awaiting user gesture):', resumeErr.message);
        }

        if (ctx.state === 'suspended') {
          // Defer playback until user gesture occurs without canceling or triggering premature end
          console.log('[Gemini TTS] AudioContext is suspended. Queued playback for next user interaction.');
          this._pendingPlayback = { audioObj, options: { onStart, onEnd } };
          return true;
        }
      }

      // 3. Decode into AudioBuffer (handling both standard WAV container and raw PCM)
      let audioBuffer = null;
      const isRiff = rawBytes.byteLength >= 4 &&
        String.fromCharCode(rawBytes[0], rawBytes[1], rawBytes[2], rawBytes[3]) === 'RIFF';

      if (isRiff) {
        try {
          const sliceBuf = rawBytes.buffer.slice(rawBytes.byteOffset, rawBytes.byteOffset + rawBytes.byteLength);
          audioBuffer = await ctx.decodeAudioData(sliceBuf);
        } catch (decErr) {
          console.warn('[Gemini TTS] decodeAudioData on WAV failed, falling back to PCM builder:', decErr.message);
        }
      }

      if (!audioBuffer) {
        try {
          const wavArrayBuf = this._pcmToWavArrayBuffer(rawBytes, 24000, 1, 16);
          audioBuffer = await ctx.decodeAudioData(wavArrayBuf.slice(0));
        } catch (wavErr) {
          audioBuffer = this._rawPcmToAudioBuffer(ctx, rawBytes, 24000);
        }
      }

      if (!audioBuffer) {
        throw new Error('Failed to decode audio into AudioBuffer');
      }

      // 4. Start playback through AudioBufferSourceNode with GainNode
      this.isSpeaking = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      if (onStart) onStart();

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1.0, ctx.currentTime); // Ensure unmuted full volume

      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      this.currentSourceNode = sourceNode;
      this.currentGainNode = gainNode;

      let hasEnded = false;
      const finalizePlayback = () => {
        if (hasEnded) return;
        hasEnded = true;
        clearTimeout(this.audioTimeout);
        this.isSpeaking = false;
        this.currentSourceNode = null;
        this.currentGainNode = null;
        console.log('[Gemini TTS] playback ended');
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
      };

      sourceNode.onended = () => {
        finalizePlayback();
      };

      // Watchdog timeout based on audio duration + 3s buffer
      const durationMs = (audioBuffer.duration * 1000) + 3000;
      this.audioTimeout = setTimeout(() => {
        if (this.isSpeaking && !hasEnded) {
          console.log('[Gemini TTS] Watchdog releasing speech lock');
          finalizePlayback();
        }
      }, Math.max(durationMs, 8000));

      sourceNode.start(0);
      console.log('[Gemini TTS] playback started');
      return true;

    } catch (err) {
      console.warn('[Gemini TTS] playback error:', err.message || err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Fallback to HTMLAudioElement if Web Audio API is completely unavailable
   */
  _playViaAudioElement(rawBytes, mimeType, { onStart, onEnd }) {
    try {
      const wavArrayBuf = this._pcmToWavArrayBuffer(rawBytes, 24000, 1, 16);
      const blob = new Blob([wavArrayBuf], { type: 'audio/wav' });
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      this.currentAudioElement = audio;

      this.isSpeaking = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      if (onStart) onStart();

      let hasEnded = false;
      const finalizeEnd = () => {
        if (hasEnded) return;
        hasEnded = true;
        clearTimeout(this.audioTimeout);
        this.isSpeaking = false;
        this.currentAudioElement = null;
        URL.revokeObjectURL(blobUrl);
        console.log('[Gemini TTS] playback ended');
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
      };

      audio.onended = () => finalizeEnd();
      audio.onerror = (e) => {
        console.warn('[Gemini TTS] playback error on audio element:', e);
        finalizeEnd();
      };

      this.audioTimeout = setTimeout(() => {
        if (this.isSpeaking && !hasEnded) finalizeEnd();
      }, 30000);

      audio.play().then(() => {
        console.log('[Gemini TTS] playback started');
      }).catch(err => {
        console.warn('[Gemini TTS] playback error on audio element play():', err.message);
        finalizeEnd();
      });

      return true;
    } catch (e) {
      console.warn('[Gemini TTS] playback error in HTMLAudioElement fallback:', e);
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Speak question or response.
   * Prioritizes Gemini 3.8 Flash Voice API, using pre-synthesized audio if provided.
   */
  async speak(text, { 
    audio = null,
    voiceName = 'Aoede', 
    useGeminiVoice = true, 
    gender = 'female', 
    rate = 1.0, 
    pitch = 1.0, 
    onBoundary, 
    onEnd, 
    onStart 
  } = {}) {
    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    // 1. If pre-synthesized Gemini Voice audio was passed, play it immediately
    if (audio?.audioBase64) {
      const played = await this.playGeminiAudio(audio, { onStart, onEnd });
      if (played) return;
    }

    // 2. Otherwise synthesize on demand via Gemini 3.8 Flash TTS endpoint
    if (useGeminiVoice) {
      try {
        const res = await api.post('/ai-interview/synthesize-voice', {
          text: text.trim(),
          voiceName: voiceName || 'Aoede'
        });

        if (res.data?.success && res.data?.data?.audioBase64) {
          const played = await this.playGeminiAudio(res.data.data, { onStart, onEnd });
          if (played) return;
        }
      } catch (geminiErr) {
        console.warn('[Gemini TTS] playback error from synthesize endpoint:', geminiErr.message);
      }
    }

    // 3. Fallback to browser SpeechSynthesis only if Gemini TTS is completely unavailable
    this._speakWithBrowserSynthesis(text, { gender, rate, pitch, onBoundary, onEnd, onStart });
  }

  /**
   * Browser SpeechSynthesis fallback with safety watchdog timeout
   */
  _speakWithBrowserSynthesis(text, { gender, rate, pitch, onBoundary, onEnd, onStart }) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not available.');
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
    } catch (_) {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.getBestVoice(gender);
    utterance.rate = rate;
    utterance.pitch = pitch;

    let hasEnded = false;
    const finalizeEnd = () => {
      if (hasEnded) return;
      hasEnded = true;
      clearTimeout(this.audioTimeout);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      finalizeEnd();
    };

    utterance.onerror = (event) => {
      console.warn('[SpeechService] Synthesis notice:', event.error || event);
      finalizeEnd();
    };

    utterance.onboundary = (event) => {
      if (this.onVisemeCallback) {
        this.onVisemeCallback(event);
      }
      if (onBoundary) onBoundary(event);
    };

    this.currentUtterance = utterance;

    const wordCount = text.split(/\s+/).length;
    const estimatedDurationMs = Math.max(4000, Math.min(30000, (wordCount / 2.5) * 1000 + 2000));
    this.audioTimeout = setTimeout(() => {
      if (this.isSpeaking && !hasEnded) {
        finalizeEnd();
      }
    }, estimatedDurationMs);

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService] synth.speak error:', err);
      finalizeEnd();
    }
  }

  stop() {
    clearTimeout(this.audioTimeout);

    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch (_) {}
      this.currentSourceNode = null;
    }

    if (this.currentGainNode) {
      try {
        this.currentGainNode.disconnect();
      } catch (_) {}
      this.currentGainNode = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (_) {}
      this.currentAudioElement = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }

    this.isSpeaking = false;
    this.currentUtterance = null;
    this._pendingPlayback = null;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  onViseme(cb) {
    this.onVisemeCallback = cb;
  }

  onStateChange(cb) {
    this.onStateChangeCallback = cb;
  }
}

export const speechService = new SpeechService();
