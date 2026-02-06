import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DemoApp - Visual-first demo for non-readers
 *
 * Fixed: Audio requires user click first (Start button)
 * Added: Back/forward navigation
 * Added: Real photos from Unsplash
 */

const EXERCISES = [
  {
    id: 'cow',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600',
    englishName: 'cow',
    spanishName: 'la vaca',
    askPrompt: "What is this?",
    correctPrompt: "Muy bien! La vaca! Great job!",
    tryAgainPrompt: "Say it in Spanish! La vaca!"
  },
  {
    id: 'chicken',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
    englishName: 'chicken',
    spanishName: 'el pollo',
    askPrompt: "What is this?",
    correctPrompt: "Excelente! El pollo! Amazing!",
    tryAgainPrompt: "Say it in Spanish! El pollo!"
  }
];

function DemoApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('start');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const exercise = EXERCISES[currentIndex];

  // Speak function - only works after user interaction
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) {
      console.log('Speech synthesis not available');
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.log('Speech error:', e);
      setIsSpeaking(false);
    };

    // Small delay helps with some browsers
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, []);

  // Start the demo (enables audio)
  const handleStart = () => {
    // Initialize speech synthesis with a user gesture
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    setPhase('asking');
    setTimeout(() => speak(exercise.askPrompt), 300);
  };

  // Handle answer
  const handleAnswer = (isSpanish) => {
    if (isSpanish) {
      speak(exercise.correctPrompt);
      setShowCelebration(true);
      setPhase('celebration');

      setTimeout(() => {
        setShowCelebration(false);
        setPhase('asking');
      }, 2500);
    } else {
      speak(exercise.tryAgainPrompt);
      setPhase('feedback');
    }
  };

  // Navigation
  const goNext = () => {
    if (currentIndex < EXERCISES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setPhase('asking');
      setTimeout(() => speak(EXERCISES[nextIndex].askPrompt), 300);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setPhase('asking');
      setTimeout(() => speak(EXERCISES[prevIndex].askPrompt), 300);
    }
  };

  // Replay audio
  const replay = () => {
    speak(exercise.askPrompt);
  };

  // Restart
  const restart = () => {
    setCurrentIndex(0);
    setPhase('start');
    setShowCelebration(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* ===== START SCREEN ===== */}
      {phase === 'start' && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            🌻 Farm Animals
          </h1>
          <p className="text-2xl text-white/90 mb-10">Learn Spanish!</p>
          <motion.button
            onClick={handleStart}
            className="bg-green-500 hover:bg-green-600 text-white text-4xl font-bold px-16 py-8 rounded-3xl shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ▶️ Start
          </motion.button>
        </motion.div>
      )}

      {/* ===== EXERCISE SCREEN ===== */}
      {phase !== 'start' && (
        <>
          {/* Left Arrow */}
          <motion.button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`fixed left-4 top-1/2 -translate-y-1/2 text-7xl z-20
              ${currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-90 hover:opacity-100 cursor-pointer'}`}
            whileHover={currentIndex > 0 ? { scale: 1.2 } : {}}
            whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
          >
            ⬅️
          </motion.button>

          {/* Right Arrow */}
          <motion.button
            onClick={goNext}
            disabled={currentIndex === EXERCISES.length - 1}
            className={`fixed right-4 top-1/2 -translate-y-1/2 text-7xl z-20
              ${currentIndex === EXERCISES.length - 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-90 hover:opacity-100 cursor-pointer'}`}
            whileHover={currentIndex < EXERCISES.length - 1 ? { scale: 1.2 } : {}}
            whileTap={currentIndex < EXERCISES.length - 1 ? { scale: 0.9 } : {}}
          >
            ➡️
          </motion.button>

          {/* Animal Image */}
          <motion.div
            key={exercise.id}
            className="relative"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
          >
            <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={exercise.image}
                alt={exercise.englishName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Sound Button */}
            <motion.button
              onClick={replay}
              disabled={isSpeaking}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white text-5xl p-4 rounded-full shadow-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isSpeaking ? '🔊' : '🔈'}
            </motion.button>
          </motion.div>

          {/* Answer Buttons */}
          <AnimatePresence>
            {!isSpeaking && (phase === 'asking' || phase === 'feedback') && (
              <motion.div
                className="mt-16 flex flex-col gap-5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Spanish (correct) */}
                <motion.button
                  onClick={() => handleAnswer(true)}
                  className="bg-green-500 hover:bg-green-600 text-white text-3xl font-bold px-12 py-6 rounded-2xl shadow-xl flex items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl">🇪🇸</span>
                  {exercise.spanishName}
                </motion.button>

                {/* English (try again) */}
                <motion.button
                  onClick={() => handleAnswer(false)}
                  className="bg-blue-400 hover:bg-blue-500 text-white text-3xl font-bold px-12 py-6 rounded-2xl shadow-xl flex items-center gap-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl">🇺🇸</span>
                  {exercise.englishName}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Dots */}
          <div className="fixed bottom-8 flex gap-4">
            {EXERCISES.map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full transition-all ${
                  i === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ===== CELEBRATION ===== */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(15)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-6xl"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 1],
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 1.2, delay: i * 0.04 }}
              >
                {['⭐', '🌟', '✨', '🎉'][i % 4]}
              </motion.span>
            ))}

            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 px-20 py-10 rounded-3xl shadow-2xl"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            >
              <span className="text-8xl">⭐</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Badge */}
      <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
        🎬 DEMO
      </div>

      {/* Restart Button */}
      {phase !== 'start' && (
        <button
          onClick={restart}
          className="fixed top-4 left-4 bg-white/90 hover:bg-white px-4 py-2 rounded-full font-medium shadow-lg"
        >
          🔄 Restart
        </button>
      )}
    </div>
  );
}

export default DemoApp;
