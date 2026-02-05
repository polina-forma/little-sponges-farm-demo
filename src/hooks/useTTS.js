import { useState, useCallback, useRef } from 'react';

/**
 * useTTS - Hook for text-to-speech functionality
 *
 * Returns:
 * - speak: (text) => Promise - Speak the given text
 * - isSpeaking: boolean
 * - stopSpeaking: () => void
 *
 * Implementation options (configured via env):
 * 1. Browser Speech Synthesis (free, basic)
 * 2. ElevenLabs API (paid, high quality)
 * 3. OpenAI TTS API (paid, good quality)
 *
 * For POC, defaults to browser Speech Synthesis
 * Set VITE_TTS_PROVIDER=elevenlabs or VITE_TTS_PROVIDER=openai for APIs
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  const speak = useCallback(async (text) => {
    const provider = import.meta.env.VITE_TTS_PROVIDER || 'browser';

    setIsSpeaking(true);

    try {
      switch (provider) {
        case 'elevenlabs':
          await speakWithElevenLabs(text, audioRef);
          break;
        case 'openai':
          await speakWithOpenAI(text, audioRef);
          break;
        default:
          await speakWithBrowser(text, utteranceRef);
      }
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS on error
      await speakWithBrowser(text, utteranceRef);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop browser speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  }, []);

  return {
    speak,
    isSpeaking,
    stopSpeaking
  };
}

/**
 * Browser Speech Synthesis
 * Free, built-in, quality varies by device
 */
async function speakWithBrowser(text, utteranceRef) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice settings
    utterance.rate = 0.85;  // Slightly slower for kids
    utterance.pitch = 1.1;  // Slightly higher pitch (friendly)
    utterance.volume = 1;

    // Try to find a good Spanish voice, fallback to default
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v =>
      v.lang.startsWith('es') && v.name.includes('Female')
    ) || voices.find(v =>
      v.lang.startsWith('es')
    );

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    // Small delay to ensure voices are loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  });
}

/**
 * ElevenLabs API
 * High quality, natural voices, paid
 */
async function speakWithElevenLabs(text, audioRef) {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      provider: 'elevenlabs'
    })
  });

  if (!response.ok) {
    throw new Error('ElevenLabs TTS failed');
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };

    audio.play();
  });
}

/**
 * OpenAI TTS API
 * Good quality, multiple voices, paid
 */
async function speakWithOpenAI(text, audioRef) {
  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      provider: 'openai'
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI TTS failed');
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };

    audio.play();
  });
}

export default useTTS;
