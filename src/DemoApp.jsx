import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DemoApp - Ultra-simplified for non-readers
 *
 * Design principles:
 * - NO TEXT on screen (kids can't read)
 * - Large visuals only
 * - Voice prompts in English
 * - Only 2 animals: cow & chicken
 * - Buttons show animal names for demo (will be voice-only in production)
 */

const DEMO_FLOW = [
  {
    animal: '🐄',
    englishName: 'cow',
    spanishName: 'la vaca',
    prompt: "What is this?",
    correctResponse: "¡Muy bien! La vaca!",
    tryAgainResponse: "Say it in Spanish! La vaca!"
  },
  {
    animal: '🐔',
    englishName: 'chicken',
    spanishName: 'el pollo',
    prompt: "What is this?",
    correctResponse: "¡Excelente! El pollo!",
    tryAgainResponse: "Say it in Spanish! El pollo!"
  }
];

function DemoApp() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('asking'); // 'asking' | 'feedback' | 'celebration' | 'done'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentAnimal = DEMO_FLOW[step];

  // Speak on load and when step changes
  useEffect(() => {
    if (phase === 'asking' && currentAnimal) {
      speak(currentAnimal.prompt);
    }
  }, [step, phase]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    setIsSpeaking(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;

    utterance.onend = () => setIsSpeaking(false);

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleAnswer = (answeredInSpanish) => {
    if (answeredInSpanish) {
      // Correct! Celebrate
      speak(currentAnimal.correctResponse);
      setShowCelebration(true);
      setPhase('celebration');

      setTimeout(() => {
        setShowCelebration(false);
        // Move to next animal or finish
        if (step < DEMO_FLOW.length - 1) {
          setStep(step + 1);
          setPhase('asking');
        } else {
          setPhase('done');
          speak("Amazing job! You're learning Spanish!");
        }
      }, 2500);
    } else {
      // Answered in English - prompt to try Spanish
      speak(currentAnimal.tryAgainResponse);
      setPhase('feedback');
    }
  };

  const restart = () => {
    setStep(0);
    setPhase('asking');
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-400 flex flex-col items-center justify-center p-4">

      {/* Main Animal Display */}
      <motion.div
        className="relative"
        key={step}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {/* Animal Circle */}
        <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full shadow-2xl flex items-center justify-center border-8 border-green-500">
          <motion.span
            className="text-[120px] md:text-[160px]"
            animate={isSpeaking ? { scale: [1, 1.1, 1] } : { y: [0, -10, 0] }}
            transition={{ duration: isSpeaking ? 0.3 : 2, repeat: Infinity }}
          >
            {phase === 'done' ? '🌟' : currentAnimal?.animal}
          </motion.span>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🔊
            </motion.span>
          </motion.div>
        )}
      </motion.div>

      {/* Response Buttons - Only visible when not speaking and in asking/feedback phase */}
      <AnimatePresence>
        {!isSpeaking && (phase === 'asking' || phase === 'feedback') && currentAnimal && (
          <motion.div
            className="mt-8 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Spanish answer button (correct) */}
            <motion.button
              onClick={() => handleAnswer(true)}
              className="bg-green-500 hover:bg-green-600 text-white text-2xl font-bold px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">🇪🇸</span>
              {currentAnimal.spanishName}
            </motion.button>

            {/* English answer button (try again) */}
            <motion.button
              onClick={() => handleAnswer(false)}
              className="bg-blue-400 hover:bg-blue-500 text-white text-2xl font-bold px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">🇺🇸</span>
              {currentAnimal.englishName}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done state - Restart button */}
      {phase === 'done' && !isSpeaking && (
        <motion.button
          onClick={restart}
          className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-2xl font-bold px-8 py-4 rounded-2xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 Play Again!
        </motion.button>
      )}

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Stars explosion */}
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-5xl"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 1, delay: i * 0.05 }}
              >
                {['⭐', '🌟', '✨'][i % 3]}
              </motion.span>
            ))}

            {/* Big star */}
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 px-12 py-6 rounded-3xl shadow-2xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            >
              <span className="text-6xl">⭐</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed bottom-8 flex gap-3">
        {DEMO_FLOW.map((_, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < step ? 'bg-green-500' :
              i === step ? 'bg-white' :
              'bg-white/40'
            }`}
            animate={i === step ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Demo mode badge */}
      <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
        🎬 DEMO
      </div>

      {/* Restart button (always visible) */}
      <button
        onClick={restart}
        className="fixed top-4 left-4 bg-white/80 hover:bg-white px-3 py-1 rounded-full text-sm"
      >
        🔄
      </button>
    </div>
  );
}

export default DemoApp;
