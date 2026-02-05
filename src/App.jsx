import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FarmScene from './components/FarmScene';
import VoiceButton from './components/VoiceButton';
import ChatBubble from './components/ChatBubble';
import TutorAvatar from './components/TutorAvatar';
import EncouragementBadge from './components/EncouragementBadge';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useConversation } from './hooks/useConversation';
import { useTTS } from './hooks/useTTS';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(null);
  const conversationEndRef = useRef(null);

  const {
    messages,
    addMessage,
    sendToTutor,
    isProcessing
  } = useConversation();

  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob
  } = useVoiceRecorder();

  const {
    speak,
    isSpeaking,
    stopSpeaking
  } = useTTS();

  // Initial greeting when app loads
  useEffect(() => {
    const initialGreeting = {
      role: 'tutor',
      content: '¡Hola, amigo! Welcome to the farm! 🐄 Mira - look at all the animals! ¿Qué animales ves? What animals do you see?',
      timestamp: new Date()
    };
    addMessage(initialGreeting);
    speak(initialGreeting.content);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob) {
      handleAudioSubmit(audioBlob);
    }
  }, [audioBlob]);

  const handleAudioSubmit = async (blob) => {
    setIsLoading(true);

    try {
      // Step 1: Transcribe audio (Whisper API)
      const transcription = await transcribeAudio(blob);

      if (transcription) {
        // Add child's message to chat
        addMessage({
          role: 'child',
          content: transcription,
          timestamp: new Date()
        });

        // Step 2: Get tutor response (Claude API)
        const tutorResponse = await sendToTutor(transcription);

        // Check for encouragement triggers
        if (tutorResponse.includes('¡Muy bien!') ||
            tutorResponse.includes('¡Excelente!') ||
            tutorResponse.includes('Great job')) {
          setShowEncouragement('star');
          setTimeout(() => setShowEncouragement(null), 3000);
        }

        // Step 3: Speak the response (TTS)
        await speak(tutorResponse);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      addMessage({
        role: 'tutor',
        content: "Oops! I didn't hear that. Can you try again? ¿Puedes repetir?",
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transcribeAudio = async (blob) => {
    // In production, this calls your /api/transcribe endpoint
    // For demo, we'll simulate
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data.transcription;
    } catch (error) {
      // Demo fallback - in production, remove this
      console.log('Using demo mode - API not connected');
      return "el pollo"; // Demo response
    }
  };

  const handleVoiceButtonClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-200 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🌻</span>
            Little Sponges - Farm Adventure
          </h1>
          <span className="text-lg">La Granja</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 flex flex-col gap-4">

        {/* Farm Scene */}
        <section className="relative">
          <FarmScene />

          {/* Tutor Avatar */}
          <div className="absolute bottom-4 right-4">
            <TutorAvatar
              isSpeaking={isSpeaking}
              isListening={isRecording}
              isThinking={isProcessing || isLoading}
            />
          </div>

          {/* Encouragement Badge */}
          <AnimatePresence>
            {showEncouragement && (
              <EncouragementBadge type={showEncouragement} />
            )}
          </AnimatePresence>
        </section>

        {/* Conversation Area */}
        <section className="bg-white rounded-2xl shadow-xl p-4 flex-1 min-h-[200px] max-h-[300px] overflow-y-auto">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <ChatBubble
                key={index}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            <div ref={conversationEndRef} />
          </div>
        </section>

        {/* Voice Controls */}
        <section className="flex justify-center pb-4">
          <VoiceButton
            isRecording={isRecording}
            isLoading={isLoading || isProcessing}
            isSpeaking={isSpeaking}
            onClick={handleVoiceButtonClick}
          />
        </section>

        {/* Help Text */}
        <p className="text-center text-green-800 text-sm">
          {isRecording
            ? "I'm listening! Speak in Spanish... 🎤"
            : isSpeaking
              ? "Listen to your tutor... 🔊"
              : "Press the button and tell me what you see! 👆"}
        </p>
      </main>

      {/* Vocabulary Reference (collapsible) */}
      <VocabularyHelper />
    </div>
  );
}

// Vocabulary helper component
function VocabularyHelper() {
  const [isOpen, setIsOpen] = useState(false);

  const vocabulary = [
    { spanish: 'la vaca', english: 'cow', emoji: '🐄' },
    { spanish: 'el cerdo', english: 'pig', emoji: '🐷' },
    { spanish: 'el pollo', english: 'chicken', emoji: '🐔' },
    { spanish: 'el caballo', english: 'horse', emoji: '🐴' },
    { spanish: 'la oveja', english: 'sheep', emoji: '🐑' },
    { spanish: 'el pato', english: 'duck', emoji: '🦆' },
    { spanish: 'el gato', english: 'cat', emoji: '🐱' },
    { spanish: 'el perro', english: 'dog', emoji: '🐕' },
  ];

  const colors = [
    { spanish: 'rojo', english: 'red', color: '#ef4444' },
    { spanish: 'azul', english: 'blue', color: '#3b82f6' },
    { spanish: 'verde', english: 'green', color: '#22c55e' },
    { spanish: 'amarillo', english: 'yellow', color: '#eab308' },
    { spanish: 'marrón', english: 'brown', color: '#a16207' },
  ];

  const numbers = [
    { spanish: 'uno', english: '1' },
    { spanish: 'dos', english: '2' },
    { spanish: 'tres', english: '3' },
    { spanish: 'cuatro', english: '4' },
    { spanish: 'cinco', english: '5' },
    { spanish: 'seis', english: '6' },
    { spanish: 'siete', english: '7' },
    { spanish: 'ocho', english: '8' },
    { spanish: 'nueve', english: '9' },
    { spanish: 'diez', english: '10' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 text-green-700 font-medium flex items-center justify-center gap-2"
      >
        <span>📚 Vocabulary Helper</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          ▲
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto">
              {/* Animals */}
              <div>
                <h3 className="font-bold text-green-700 mb-2">Animals 🐾</h3>
                <div className="space-y-1 text-sm">
                  {vocabulary.map(item => (
                    <div key={item.spanish} className="flex items-center gap-2">
                      <span>{item.emoji}</span>
                      <span className="font-medium">{item.spanish}</span>
                      <span className="text-gray-500">({item.english})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3 className="font-bold text-green-700 mb-2">Colors 🎨</h3>
                <div className="space-y-1 text-sm">
                  {colors.map(item => (
                    <div key={item.spanish} className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.spanish}</span>
                      <span className="text-gray-500">({item.english})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numbers */}
              <div>
                <h3 className="font-bold text-green-700 mb-2">Numbers 🔢</h3>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {numbers.map(item => (
                    <div key={item.spanish} className="flex items-center gap-1">
                      <span className="font-bold text-green-600">{item.english}</span>
                      <span>= {item.spanish}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
