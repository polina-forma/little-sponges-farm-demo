import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CONFIG ───────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3001';
const MAX_ATTEMPTS = 3; // after this many wrong attempts, give the answer

// ─── BRAND COLORS ─────────────────────────────────────────────────
const COLORS = {
  gold: '#F7AD00',
  teal: '#05544B',
  cyan: '#5BC0DE',
  cream: '#FFF9EC',
  white: '#FFFFFF',
  warmGray: '#6B7280',
};

// ─── EXERCISE DATA ────────────────────────────────────────────────
// Images load from /public/images/unit1/ — drop your real photos there
const exercises = [
  {
    id: 1,
    animal: 'Cow',
    spanishName: 'la vaca',
    image: '/images/unit1/cow.jpg',
    teacherAsk: '¿Cómo se dice cow en español?',
    correctResponse: '¡Muy bien! La vaca! 🐄',
    tryAgainResponse: 'Almost! Try saying: la vaca',
  },
  {
    id: 2,
    animal: 'Rooster',
    spanishName: 'el gallo',
    image: '/images/unit1/rooster.jpg',
    teacherAsk: '¿Cómo se dice rooster en español?',
    correctResponse: '¡Excelente! El gallo! 🐓',
    tryAgainResponse: 'Try again! Say: el gallo',
  },
  {
    id: 3,
    animal: 'Sheep',
    spanishName: 'la oveja',
    image: '/images/unit1/sheep.jpg',
    teacherAsk: '¿Cómo se dice sheep en español?',
    correctResponse: '¡Fantástico! La oveja! 🐑',
    tryAgainResponse: 'Close! Try saying: la oveja',
  },
  {
    id: 4,
    animal: 'Horse',
    spanishName: 'el caballo',
    image: '/images/unit1/horse.jpg',
    teacherAsk: '¿Cómo se dice horse en español?',
    correctResponse: '¡Perfecto! El caballo! 🐴',
    tryAgainResponse: 'Almost! Say: el caballo',
  },
  {
    id: 5,
    animal: 'Pig',
    spanishName: 'el cerdo',
    image: '/images/unit1/pig.jpg',
    teacherAsk: '¿Cómo se dice pig en español?',
    correctResponse: '¡Genial! El cerdo! 🐷',
    tryAgainResponse: 'Try again! Say: el cerdo',
  },
];

// ─── AVATAR TEACHER ───────────────────────────────────────────────
function TeacherAvatar({ isSpeaking, size = 220 }) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${COLORS.gold}, #FFD54F)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        boxShadow: isSpeaking
          ? `0 0 30px ${COLORS.gold}88, 0 0 60px ${COLORS.gold}44`
          : `0 8px 30px rgba(0,0,0,0.15)`,
        border: `5px solid ${COLORS.white}`,
        flexShrink: 0,
      }}
      animate={isSpeaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 1.2 } : {}}
    >
      🦉
    </motion.div>
  );
}

// ─── MICROPHONE BUTTON ────────────────────────────────────────────
function MicButton({ onClick, isListening, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      style={{
        width: 110,
        height: 110,
        borderRadius: '50%',
        border: 'none',
        background: isListening
          ? '#EF4444'
          : disabled
          ? '#D1D5DB'
          : COLORS.teal,
        color: COLORS.white,
        fontSize: 44,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: isListening
          ? '0 0 0 8px rgba(239,68,68,0.3)'
          : '0 6px 20px rgba(0,0,0,0.2)',
      }}
    >
      {isListening && (
        <motion.div
          style={{
            position: 'absolute',
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '4px solid #EF4444',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
      🎤
    </motion.button>
  );
}

// ─── FROG CELEBRATION ─────────────────────────────────────────────
function FrogCelebration({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5,84,75,0.92)',
        zIndex: 100,
      }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ fontSize: 140 }}
      >
        🐸
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          color: COLORS.gold,
          fontSize: 36,
          fontWeight: 800,
          fontFamily: 'Nunito, sans-serif',
          marginTop: 20,
          textAlign: 'center',
        }}
      >
        ¡Increíble! Amazing job! 🌟
      </motion.p>
    </motion.div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = ((current) / total) * 100;
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 500,
        height: 14,
        background: '#E5E7EB',
        borderRadius: 7,
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <motion.div
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6 }}
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.cyan})`,
          borderRadius: 7,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function DemoApp() {
  // --- state ---
  const [phase, setPhase] = useState('start');
  const [exIndex, setExIndex] = useState(0);
  const [subtitle, setSubtitle] = useState({ text: '', speaker: '' });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showFrog, setShowFrog] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const exercise = exercises[exIndex];

  // --- cleanup ---
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // --- AI Text-to-Speech (HD quality) ---
  const speakAI = useCallback(async (text) => {
    setIsSpeaking(true);
    try {
      const res = await fetch(`${API_BASE}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
      // Fallback to browser TTS
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.85;
        u.pitch = 1.1;
        u.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    }
  }, []);

  // --- Start exercise ---
  const startExercise = useCallback(() => {
    setPhase('asking');
    setAttemptCount(0);
    setShowCorrectAnswer(false);
    setHeardText('');
    const ex = exercises[exIndex];
    setSubtitle({ text: ex.teacherAsk, speaker: 'teacher' });
    speakAI(ex.teacherAsk);
  }, [exIndex, speakAI]);

  // --- Speech recognition ---
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSubtitle({ text: 'Speech recognition not supported in this browser. Use Chrome!', speaker: 'system' });
      return;
    }

    const recognition = new SR();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setHeardText(spoken);
      setIsListening(false);
      evaluateAnswer(spoken);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setSubtitle({ text: "I didn't hear anything. Tap the mic and try again!", speaker: 'teacher' });
        setPhase('asking');
      } else if (event.error === 'not-allowed') {
        setSubtitle({ text: 'Please allow microphone access in your browser.', speaker: 'system' });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    setPhase('listening');
    setSubtitle({ text: "I'm listening... 🎧", speaker: 'teacher' });
    recognition.start();
  }, []);

  // --- Evaluate answer ---
  const evaluateAnswer = async (spokenText) => {
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);
    setPhase('evaluating');
    setIsEvaluating(true);
    setSubtitle({ text: 'Let me check... 🤔', speaker: 'teacher' });

    try {
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenText,
          targetWord: exercise.spanishName,
          targetLanguage: 'Spanish',
          attemptNumber: newAttempt,
        }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const result = await res.json();

      if (result.correct) {
        handleCorrect(result.feedback);
      } else if (result.giveAnswer || newAttempt >= MAX_ATTEMPTS) {
        // After max attempts — give the answer, ask child to repeat
        handleGiveAnswer(result.feedback);
      } else {
        handleTryAgain(result.feedback);
      }
    } catch (err) {
      console.error('Evaluate error:', err);
      // Fallback: simple string matching
      const target = exercise.spanishName.toLowerCase().replace(/^(el |la |los |las )/, '');
      const heard = spokenText.toLowerCase().replace(/^(el |la |los |las )/, '');
      if (heard.includes(target) || target.includes(heard)) {
        handleCorrect(exercise.correctResponse);
      } else if (newAttempt >= MAX_ATTEMPTS) {
        handleGiveAnswer(`The word is ${exercise.spanishName}! Can you say it with me?`);
      } else {
        handleTryAgain(exercise.tryAgainResponse);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // --- CORRECT answer ---
  const handleCorrect = (feedback) => {
    setPhase('correct');
    setSubtitle({ text: feedback || exercise.correctResponse, speaker: 'teacher' });
    speakAI(feedback || exercise.correctResponse);
    const newStreak = streak + 1;
    setStreak(newStreak);

    // Frog celebration every 3 correct
    if (newStreak > 0 && newStreak % 3 === 0) {
      setTimeout(() => setShowFrog(true), 2000);
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (exIndex < exercises.length - 1) {
        setExIndex((i) => i + 1);
        setAttemptCount(0);
        setShowCorrectAnswer(false);
        setHeardText('');
        setTimeout(() => startExercise(), 300);
      } else {
        setPhase('complete');
        setSubtitle({ text: '🎉 You finished the lesson! Amazing work!', speaker: 'teacher' });
        speakAI('You finished the lesson! Amazing work!');
      }
    }, 4000);
  };

  // --- GIVE ANSWER (after max attempts) ---
  const handleGiveAnswer = (feedback) => {
    setPhase('giveAnswer');
    setShowCorrectAnswer(true);
    const msg = feedback || `The word is ${exercise.spanishName}! Say it with me: ${exercise.spanishName}!`;
    setSubtitle({ text: msg, speaker: 'teacher' });
    speakAI(msg);
  };

  // --- TRY AGAIN ---
  const handleTryAgain = (feedback) => {
    setPhase('tryAgain');
    setStreak(0);
    const msg = feedback || exercise.tryAgainResponse;
    setSubtitle({ text: msg, speaker: 'teacher' });
    speakAI(msg);
  };

  // ───────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${COLORS.cream} 0%, #FFF3D6 100%)`,
        fontFamily: "'Nunito', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px',
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.teal,
            margin: 0,
          }}
        >
          🦉 Little Sponges
        </h1>
        <p style={{ color: COLORS.warmGray, fontSize: 16, margin: '4px 0 0' }}>
          Farm Animals — Unit 1
        </p>
      </div>

      {/* PROGRESS BAR */}
      {phase !== 'start' && phase !== 'complete' && (
        <div style={{ width: '100%', maxWidth: 500, marginBottom: 20 }}>
          <ProgressBar current={exIndex} total={exercises.length} />
          <p
            style={{
              textAlign: 'center',
              fontSize: 14,
              color: COLORS.warmGray,
              marginTop: 6,
            }}
          >
            {exIndex + 1} of {exercises.length}
            {streak > 1 && ` · 🔥 ${streak} in a row!`}
          </p>
        </div>
      )}

      {/* ── START SCREEN ── */}
      {phase === 'start' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginTop: 40 }}
        >
          <TeacherAvatar isSpeaking={false} size={180} />
          <h2
            style={{
              fontSize: 28,
              color: COLORS.teal,
              marginTop: 24,
              fontWeight: 800,
            }}
          >
            Ready to learn Spanish?
          </h2>
          <p style={{ color: COLORS.warmGray, fontSize: 18, marginBottom: 30 }}>
            Use your voice! 🎤
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startExercise}
            style={{
              background: `linear-gradient(135deg, ${COLORS.teal}, #0E7A6B)`,
              color: COLORS.white,
              border: 'none',
              borderRadius: 20,
              padding: '18px 50px',
              fontSize: 24,
              fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
              cursor: 'pointer',
              boxShadow: '0 6px 25px rgba(5,84,75,0.3)',
            }}
          >
            🎤 Let's Go!
          </motion.button>
        </motion.div>
      )}

      {/* ── EXERCISE SCREEN ── */}
      {phase !== 'start' && phase !== 'complete' && (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
          }}
        >
          {/* TEACHER AVATAR — large, same visual weight as image */}
          <TeacherAvatar isSpeaking={isSpeaking} size={220} />

          {/* SUBTITLE (teacher speech) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={subtitle.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: COLORS.white,
                borderRadius: 20,
                padding: '16px 28px',
                margin: '16px 0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                maxWidth: 500,
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: 22,
                  color: COLORS.teal,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {subtitle.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ANIMAL IMAGE — large */}
          <motion.div
            style={{
              width: 280,
              height: 280,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              border: `4px solid ${COLORS.gold}`,
              background: COLORS.white,
              margin: '8px 0',
            }}
          >
            <img
              src={exercise.image}
              alt={exercise.animal}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                // Fallback if image missing — show emoji placeholder
                e.target.style.display = 'none';
                e.target.parentElement.style.display = 'flex';
                e.target.parentElement.style.alignItems = 'center';
                e.target.parentElement.style.justifyContent = 'center';
                e.target.parentElement.style.fontSize = '100px';
                e.target.parentElement.innerHTML = '🖼️';
              }}
            />
          </motion.div>

          {/* WORD LABEL — large, clear, under the picture */}
          <div
            style={{
              background: COLORS.teal,
              borderRadius: 16,
              padding: '14px 36px',
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: COLORS.gold,
                margin: 0,
                letterSpacing: 1,
                textAlign: 'center',
              }}
            >
              {exercise.spanishName}
            </p>
            <p
              style={{
                fontSize: 18,
                color: COLORS.white,
                margin: '4px 0 0',
                textAlign: 'center',
                opacity: 0.85,
              }}
            >
              ({exercise.animal})
            </p>
          </div>

          {/* HEARD TEXT (what the mic picked up) */}
          {heardText && (
            <p
              style={{
                fontSize: 16,
                color: COLORS.warmGray,
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              You said: "{heardText}"
            </p>
          )}

          {/* ── ACTION AREA ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 16,
              gap: 12,
            }}
          >
            {/* LISTENING / ASKING — show mic button */}
            {(phase === 'asking' || phase === 'listening' || phase === 'tryAgain') && !isSpeaking && (
              <div style={{ textAlign: 'center' }}>
                <MicButton
                  onClick={startListening}
                  isListening={isListening}
                  disabled={isListening || isSpeaking}
                />
                <p style={{ fontSize: 16, color: COLORS.warmGray, marginTop: 10 }}>
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </p>
              </div>
            )}

            {/* EVALUATING — spinner */}
            {phase === 'evaluating' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 50,
                  height: 50,
                  border: `4px solid ${COLORS.cream}`,
                  borderTop: `4px solid ${COLORS.teal}`,
                  borderRadius: '50%',
                }}
              />
            )}

            {/* GIVE ANSWER — show mic to let child repeat */}
            {phase === 'giveAnswer' && !isSpeaking && (
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: 20,
                    color: COLORS.teal,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  Now you try! Say: <span style={{ color: COLORS.gold }}>{exercise.spanishName}</span>
                </p>
                <MicButton
                  onClick={() => {
                    // When child repeats after being given answer, be very generous
                    startListening();
                  }}
                  isListening={isListening}
                  disabled={isListening || isSpeaking}
                />
              </div>
            )}

            {/* CORRECT — auto-advancing */}
            {phase === 'correct' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ fontSize: 60 }}
              >
                ⭐
              </motion.div>
            )}

            {/* Replay question button */}
            {(phase === 'asking' || phase === 'tryAgain') && !isSpeaking && !isListening && (
              <button
                onClick={() => speakAI(exercise.teacherAsk)}
                style={{
                  background: 'transparent',
                  border: `2px solid ${COLORS.cyan}`,
                  borderRadius: 12,
                  padding: '8px 20px',
                  fontSize: 15,
                  color: COLORS.cyan,
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                }}
              >
                🔊 Hear question again
              </button>
            )}

            {/* Attempt indicator */}
            {attemptCount > 0 && phase !== 'correct' && phase !== 'complete' && (
              <p style={{ fontSize: 14, color: COLORS.warmGray }}>
                Attempt {attemptCount} of {MAX_ATTEMPTS}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* ── COMPLETE SCREEN ── */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', marginTop: 40 }}
        >
          <div style={{ fontSize: 100, marginBottom: 20 }}>🎉</div>
          <h2
            style={{
              fontSize: 32,
              color: COLORS.teal,
              fontWeight: 800,
            }}
          >
            Lesson Complete!
          </h2>
          <p style={{ fontSize: 20, color: COLORS.warmGray, marginBottom: 30 }}>
            You learned {exercises.length} farm animals in Spanish!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setExIndex(0);
              setStreak(0);
              setAttemptCount(0);
              setShowCorrectAnswer(false);
              setHeardText('');
              setPhase('start');
            }}
            style={{
              background: `linear-gradient(135deg, ${COLORS.gold}, #FFD54F)`,
              color: COLORS.teal,
              border: 'none',
              borderRadius: 20,
              padding: '16px 40px',
              fontSize: 22,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            🔄 Play Again
          </motion.button>
        </motion.div>
      )}

      {/* FROG CELEBRATION OVERLAY */}
      <AnimatePresence>
        {showFrog && <FrogCelebration onDone={() => setShowFrog(false)} />}
      </AnimatePresence>
    </div>
  );
}
