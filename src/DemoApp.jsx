import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DemoApp - Little Sponges English ESL Tutor (Farm Adventure)
 *
 * Flow per card (conversational deepening):
 *   1. "What is this?" → child says animal name
 *   2. If correct on first try → "What color is the [animal]?" → child says color
 *   3. If correct on first try → "How many [animals] do you see?" → child says number
 *   Then advance to next card.
 *
 * After 5 cards: open-ended "What is your favorite animal?"
 *
 * Voice: Pre-recorded ElevenLabs Motivational Buddy with API fallback
 * Evaluation: Local fuzzy word matching (instant, no API lag)
 * STT: Web Speech API (Chrome)
 */

// ─── Config ───
const API_BASE = 'http://localhost:3001';
const MAX_ATTEMPTS = 3;
const CARDS_PER_GAME = 3;

// ─── Farm Animals pool (only animals we have images for) ───
// plural: used in questions/responses for count > 1
// type: 'animal' or 'bird' — used for question variety
const ANIMAL_POOL = [
  { id: 'horse', image: '/images/unit1/Brown Horse.png', word: 'horse', plural: 'horses', color: 'brown', count: 1, type: 'animal' },
  { id: 'cow', image: '/images/unit1/Cow.png', word: 'cow', plural: 'cows', color: 'brown', count: 1, type: 'animal' },
  { id: 'chicken', image: '/images/unit1/Chicken.png', word: 'chicken', plural: 'chickens', color: 'black and white', count: 1, type: 'bird' },
  { id: 'sheep', image: '/images/unit1/Sheep.png', word: 'sheep', plural: 'sheep', color: 'white', count: 1, type: 'animal' },
  { id: 'pig', image: '/images/unit1/Pig.png', word: 'pig', plural: 'pigs', color: 'pink', count: 1, type: 'animal' },
  { id: 'duck', image: '/images/unit1/Duck.png', word: 'duck', plural: 'ducks', color: 'brown', count: 1, type: 'bird' },
  { id: 'goose', image: '/images/unit1/Geese.png', word: 'goose', plural: 'geese', color: 'white', count: 2, type: 'bird' },
  { id: 'rabbit', image: '/images/unit1/Rabbits.png', word: 'rabbit', plural: 'rabbits', color: 'brown', count: 2, type: 'animal' },
  { id: 'turkey', image: '/images/unit1/Turkey.png', word: 'turkey', plural: 'turkeys', color: 'brown', count: 1, type: 'bird' },
];

// Tier 1 question variants — randomly picked per card
const NAME_QUESTIONS = {
  animal: [
    { audio: '/audio/what-is-this.mp3', text: 'What is this?' },
    { audio: '/audio/what-animal-is-this.mp3', text: 'What animal is this?' },
    { audio: '/audio/what-animal-do-you-see.mp3', text: 'What animal do you see?' },
  ],
  bird: [
    { audio: '/audio/what-is-this.mp3', text: 'What is this?' },
    { audio: '/audio/what-bird-is-this.mp3', text: 'What bird is this?' },
    { audio: '/audio/what-bird-do-you-see.mp3', text: 'What bird do you see?' },
  ],
};

// All valid farm animal words (for open-ended "favorite" question)
const ALL_ANIMAL_WORDS = ANIMAL_POOL.map((a) => a.word);

// Shuffle and pick N
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Brand Colors (Little Sponges game palette) ───
const BRAND = {
  gold: '#F7AD00',
  goldLight: '#FFC940',
  teal: '#05544B',
  tealLight: '#0A7B6B',
  cyan: '#5BC0DE',
  cyanDark: '#3AAFCF',
  white: '#FFFFFF',
  cream: '#FFF9EC',
  gray: '#728188',
  orange: '#FF6B35',
  orangeDark: '#E55A2B',
  red: '#E74C3C',
  redDark: '#C0392B',
  skyBlue: '#87CEEB',
  grassGreen: '#4CAF50',
  btnGreen: '#5BBF2F',
  btnGreenDark: '#4A9E26',
  hotPink: '#FF4893',
  hotPinkDark: '#D93A7A',
};

const LOGO_SRC = '/images/little-sponges-logo.png';

// ════════════════════════════════════════════════════════
// ─── LOCAL FUZZY WORD MATCHING
// ════════════════════════════════════════════════════════
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(spokenAlternatives, targetWord) {
  const target = targetWord.toLowerCase().trim();
  console.log(`[MATCH] target="${target}", alternatives=`, spokenAlternatives);

  for (const alt of spokenAlternatives) {
    const spoken = alt.toLowerCase().trim();
    if (spoken === target) return true;
    if (spoken.includes(target)) return true;
    const words = spoken.split(/\s+/);
    for (const w of words) {
      if (w === target) return true;
      if (w.length >= target.length - 1 && levenshtein(w, target) <= 1) return true;
    }
    if (spoken.endsWith('s') && levenshtein(spoken.slice(0, -1), target) <= 1) return true;
  }
  return false;
}

// Also check if spoken matches ANY of several valid answers
function fuzzyMatchAny(spokenAlternatives, targetWords) {
  return targetWords.some((t) => fuzzyMatch(spokenAlternatives, t));
}

// Number word matching (accept "1" or "one", etc.)
// STRICT — no fuzzy/levenshtein for numbers (single digits are all distance 1 from each other)
const NUMBER_WORDS = {
  1: ['one', '1', 'won'], 2: ['two', '2', 'to', 'too'], 3: ['three', '3'],
  4: ['four', '4', 'for'], 5: ['five', '5'], 6: ['six', '6'],
  7: ['seven', '7'], 8: ['eight', '8', 'ate'], 9: ['nine', '9'],
  10: ['ten', '10'],
};

function fuzzyMatchNumber(spokenAlternatives, targetNum) {
  const validWords = NUMBER_WORDS[targetNum] || [];
  // Strict exact match only — no levenshtein for numbers
  for (const alt of spokenAlternatives) {
    const words = alt.toLowerCase().trim().split(/\s+/);
    for (const w of words) {
      if (validWords.includes(w)) return true;
    }
  }
  return false;
}

// ════════════════════════════════════════════════════════
// ─── AUDIO SYSTEM
// ════════════════════════════════════════════════════════

function useAudioPlayer() {
  const audioRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(async (audioPath, fallbackText) => {
    try {
      setSpeaking(true);
      if (audioRef.current) { audioRef.current.pause(); }

      const audio = new Audio(audioPath);
      audioRef.current = audio;

      const playResult = await new Promise((resolve) => {
        audio.onended = () => resolve('done');
        audio.onerror = () => resolve('error');
        audio.play().catch(() => resolve('error'));
      });

      if (playResult === 'error' && fallbackText) {
        console.log(`Fallback TTS for: ${audioPath}`);
        try {
          const res = await fetch(`${API_BASE}/api/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: fallbackText, voice: 'fable' }),
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const fallback = new Audio(url);
            audioRef.current = fallback;
            await new Promise((resolve) => {
              fallback.onended = resolve;
              fallback.onerror = resolve;
              fallback.play().catch(resolve);
            });
          }
        } catch { /* silent */ }
      }
    } catch (err) {
      console.error('Audio error:', err);
    } finally {
      setSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// ─── Hook: Web Speech API STT ───
function useSTT() {
  const recogRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState({ text: '', alternatives: [], id: 0 });
  const idRef = useRef(0);
  const timeoutRef = useRef(null);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }

    if (recogRef.current) { try { recogRef.current.abort(); } catch (_) {} }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); }

    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 5;
    recog.continuous = false;

    recog.onresult = (e) => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      const alts = [];
      for (let i = 0; i < e.results[0].length; i++) {
        alts.push(e.results[0][i].transcript.toLowerCase().trim());
      }
      const best = alts[0] || '';
      idRef.current += 1;
      setResult({ text: best, alternatives: alts, id: idRef.current });
      setListening(false);
    };
    recog.onerror = (e) => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      console.warn('Speech recognition error:', e.error, e.message);
      setListening(false);
    };
    recog.onend = () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      setListening(false);
    };

    recogRef.current = recog;
    setListening(true);
    try { recog.start(); } catch (e) {
      console.error('Speech recognition start failed:', e);
      setListening(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      try { recog.abort(); } catch (_) {}
      setListening(false);
      timeoutRef.current = null;
    }, 8000);
  }, []);

  const stopListening = useCallback(() => {
    if (recogRef.current) { try { recogRef.current.stop(); } catch (_) {} }
    setListening(false);
  }, []);

  return { startListening, stopListening, listening, transcript: result.text, alternatives: result.alternatives, transcriptId: result.id };
}

// ─── Little Sponges Logo ───
function LittleSpongesLogo() {
  return (
    <img src={LOGO_SRC} alt="Little Sponges®"
      style={{ height: 40, objectFit: 'contain', userSelect: 'none' }} />
  );
}

// ─── Farm Background (inline SVG) ───
function FarmBackground() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC8E3" /><stop offset="60%" stopColor="#ADE4F7" /><stop offset="100%" stopColor="#D4F1FF" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6DBE45" /><stop offset="100%" stopColor="#4A9E26" />
        </linearGradient>
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ECF55" /><stop offset="100%" stopColor="#5BB82F" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6DC048" /><stop offset="100%" stopColor="#4FA828" />
        </linearGradient>
        <linearGradient id="barnWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D94040" /><stop offset="100%" stopColor="#B33030" />
        </linearGradient>
        <linearGradient id="barnRoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B4513" /><stop offset="100%" stopColor="#6B3410" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sky)" />
      <circle cx="1280" cy="120" r="70" fill="#FFE066" opacity="0.9" />
      <circle cx="1280" cy="120" r="55" fill="#FFD633" />
      <g opacity="0.85"><ellipse cx="250" cy="100" rx="80" ry="35" fill="white" /><ellipse cx="310" cy="90" rx="60" ry="30" fill="white" /><ellipse cx="200" cy="95" rx="55" ry="28" fill="white" /></g>
      <g opacity="0.7"><ellipse cx="750" cy="140" rx="70" ry="28" fill="white" /><ellipse cx="800" cy="130" rx="55" ry="24" fill="white" /><ellipse cx="710" cy="135" rx="45" ry="22" fill="white" /></g>
      <g opacity="0.6"><ellipse cx="1050" cy="80" rx="60" ry="25" fill="white" /><ellipse cx="1100" cy="72" rx="50" ry="22" fill="white" /></g>
      <ellipse cx="300" cy="560" rx="450" ry="160" fill="url(#hill2)" />
      <ellipse cx="1100" cy="580" rx="500" ry="170" fill="url(#hill2)" />
      <ellipse cx="700" cy="620" rx="900" ry="180" fill="url(#hill1)" />
      <rect x="0" y="620" width="1440" height="280" fill="url(#grass)" />
      <g transform="translate(80, 380)">
        <rect x="0" y="60" width="160" height="130" rx="4" fill="url(#barnWall)" />
        <polygon points="-15,60 80,-10 175,60" fill="url(#barnRoof)" />
        <rect x="65" y="-18" width="30" height="14" rx="3" fill="#6B3410" />
        <rect x="50" y="110" width="60" height="80" rx="30 30 0 0" fill="#6B3410" />
        <rect x="55" y="115" width="50" height="75" rx="25 25 0 0" fill="#3B1E08" />
        <line x1="80" y1="115" x2="80" y2="190" stroke="#6B3410" strokeWidth="3" />
        <line x1="55" y1="155" x2="105" y2="155" stroke="#6B3410" strokeWidth="3" />
        <rect x="15" y="90" width="25" height="22" rx="2" fill="#FFE8A0" opacity="0.8" />
        <rect x="120" y="90" width="25" height="22" rx="2" fill="#FFE8A0" opacity="0.8" />
        <circle cx="80" cy="35" r="14" fill="#FFE8A0" opacity="0.7" />
      </g>
      <g transform="translate(260, 370)">
        <rect x="0" y="30" width="45" height="140" rx="6" fill="#C8C8C8" />
        <ellipse cx="22" cy="30" rx="23" ry="10" fill="#B0B0B0" />
        <rect x="5" y="0" width="35" height="35" rx="4" fill="#A0A0A0" />
        <ellipse cx="22" cy="4" rx="18" ry="7" fill="#909090" />
      </g>
      <g opacity="0.85">
        {[100, 220, 340, 460, 580, 860, 980, 1100, 1220, 1340].map((x) => (
          <g key={x}><rect x={x} y="610" width="12" height="70" rx="2" fill="#8B6914" /><ellipse cx={x + 6} cy="610" rx="8" ry="4" fill="#A07A1A" /></g>
        ))}
        <rect x="90" y="625" width="480" height="8" rx="3" fill="#A07A1A" />
        <rect x="90" y="650" width="480" height="8" rx="3" fill="#A07A1A" />
        <rect x="850" y="625" width="510" height="8" rx="3" fill="#A07A1A" />
        <rect x="850" y="650" width="510" height="8" rx="3" fill="#A07A1A" />
      </g>
      <g transform="translate(1300, 400)">
        <rect x="15" y="50" width="20" height="80" rx="4" fill="#7A5C2E" />
        <ellipse cx="25" cy="30" rx="45" ry="50" fill="#3D8B37" />
        <ellipse cx="15" cy="40" rx="35" ry="40" fill="#4A9E26" />
      </g>
      <g transform="translate(1370, 430)">
        <rect x="10" y="40" width="16" height="60" rx="3" fill="#7A5C2E" />
        <ellipse cx="18" cy="22" rx="35" ry="40" fill="#3D8B37" />
      </g>
      <g opacity="0.7">
        <circle cx="150" cy="680" r="5" fill="#FF6B8A" /><circle cx="165" cy="690" r="4" fill="#FFD633" />
        <circle cx="140" cy="695" r="4" fill="#FF6B8A" /><circle cx="900" cy="670" r="5" fill="#FFD633" />
        <circle cx="920" cy="682" r="4" fill="#FF6B8A" /><circle cx="885" cy="685" r="4" fill="#FFD633" />
        <circle cx="1200" cy="700" r="4" fill="#FF6B8A" /><circle cx="1215" cy="695" r="5" fill="#FFD633" />
        <circle cx="500" cy="710" r="4" fill="#FF6B8A" /><circle cx="515" cy="705" r="5" fill="#FFD633" />
      </g>
      <g transform="translate(270, 520)"><ellipse cx="0" cy="0" rx="25" ry="18" fill="#D4A843" /></g>
      <g transform="translate(320, 530)"><ellipse cx="0" cy="0" rx="22" ry="16" fill="#D4A843" /></g>
      <path d="M 700,900 Q 680,800 720,720 Q 750,660 700,620" fill="none" stroke="#C4A265" strokeWidth="40" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Star Row ───
function StarRow({ score }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', minHeight: 36 }}>
      {Array.from({ length: score }, (_, i) => (
        <motion.span key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }} style={{ fontSize: 32 }}>⭐</motion.span>
      ))}
    </div>
  );
}

// ─── Frog Video Avatar ───
const FROG_VIDEOS = { idle: '/videos/frog-idle.mp4', correct: '/videos/frog-correct.mp4', tryagain: '/videos/frog-tryagain.mp4' };

function FrogAvatar({ size = 360, state = 'idle' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState(FROG_VIDEOS.idle);
  const videoSrc = FROG_VIDEOS[state] || FROG_VIDEOS.idle;

  useEffect(() => { if (videoSrc !== currentSrc) setCurrentSrc(videoSrc); }, [videoSrc, currentSrc]);
  useEffect(() => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); } }, [currentSrc]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const drawFrame = () => {
      if (video.readyState < 2) { animRef.current = requestAnimationFrame(drawFrame); return; }
      const w = video.videoWidth, h = video.videoHeight;
      if (!w || !h) { animRef.current = requestAnimationFrame(drawFrame); return; }
      canvas.width = w; canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const blueness = b - Math.max(r, g);
        if (b > 100 && blueness > 50) { d[i + 3] = 0; }
        else if (b > 60 && blueness > 20) { d[i + 3] = Math.round((1 - Math.min(1, (blueness - 20) / 40)) * 255); }
      }
      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(drawFrame);
    };

    const onPlay = () => drawFrame();
    video.addEventListener('play', onPlay);
    if (!video.paused) drawFrame();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); video.removeEventListener('play', onPlay); };
  }, [currentSrc]);

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <video ref={videoRef} src={currentSrc} autoPlay loop muted playsInline
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
}

// ─── Speech Bubble ───
function SpeechBubble({ text, visible }) {
  if (!visible || !text) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ maxWidth: 300, fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, lineHeight: 1.4,
        color: BRAND.white, textAlign: 'center', textShadow: `2px 2px 4px ${BRAND.teal}` }}>
      {text}
    </motion.div>
  );
}

// ─── Round Button ───
function RoundButton({ onClick, color, darkColor, size = 80, icon, label, disabled = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <motion.button whileHover={!disabled ? { scale: 1.1 } : {}} whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={onClick} disabled={disabled}
        style={{ width: size, height: size, borderRadius: '50%', border: `4px solid ${darkColor}`,
          cursor: disabled ? 'default' : 'pointer',
          background: `radial-gradient(circle at 35% 35%, ${color}, ${darkColor})`,
          color: BRAND.white, fontSize: size * 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 16px ${darkColor}60, inset 0 2px 4px rgba(255,255,255,0.3)`,
          opacity: disabled ? 0.5 : 1 }}>
        {icon}
      </motion.button>
      {label && <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 800,
        color: BRAND.white, textShadow: `1px 1px 3px ${BRAND.teal}` }}>{label}</span>}
    </div>
  );
}

// ─── Mic Button ───
function MicButton({ listening, onClick, disabled }) {
  return (
    <RoundButton onClick={onClick} disabled={disabled}
      color={listening ? BRAND.red : BRAND.hotPink}
      darkColor={listening ? BRAND.redDark : BRAND.hotPinkDark}
      size={120} icon={listening ? '⏹' : '🎤'}
      label={listening ? 'Listening...' : 'Tap to talk!'} />
  );
}

// ═══════════════════════════════════════════════════
// ─── MAIN APP ─────────────────────────────────────
// ═══════════════════════════════════════════════════

/*
 * Question tiers per card:
 *   'name'  → "What is this?" → expects animal word
 *   'color' → "What color is the [animal]?" → expects color word
 *   'count' → "How many [animals] do you see?" → expects number word
 *   'favorite' → open-ended at the very end
 */

export default function DemoApp() {
  const [deck, setDeck] = useState(() => pickRandom(ANIMAL_POOL, CARDS_PER_GAME));
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [questionTier, setQuestionTier] = useState('name'); // name | color | count
  const [phase, setPhase] = useState('start'); // start | intro | respond | feedback | giveAnswer | celebrate | complete | favorite
  const [feedbackText, setFeedbackText] = useState('');
  const [correctIds, setCorrectIds] = useState(new Set());
  const [attemptNumber, setAttemptNumber] = useState(1);

  // Game state ref (sync reads — no stale closures)
  const gameRef = useRef({
    exerciseIndex: 0, attemptNumber: 1, phase: 'start', questionTier: 'name',
  });
  const advanceTimerRef = useRef(null);
  const gameOverRef = useRef(false);
  const completionPlayedRef = useRef(false);
  const lastProcessedTranscriptId = useRef(0);
  const score = correctIds.size;

  const updateGame = useCallback((updates) => {
    Object.assign(gameRef.current, updates);
    if ('attemptNumber' in updates) setAttemptNumber(updates.attemptNumber);
    if ('exerciseIndex' in updates) setExerciseIndex(updates.exerciseIndex);
    if ('phase' in updates) setPhase(updates.phase);
    if ('questionTier' in updates) setQuestionTier(updates.questionTier);
  }, []);

  const { speak, stop: stopAudio, speaking } = useAudioPlayer();
  const { startListening, stopListening, listening, transcript, alternatives, transcriptId } = useSTT();

  const exercise = deck[exerciseIndex] || deck[0];

  // Cancel timers
  const cancelTimers = useCallback(() => {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
  }, []);

  // ─── Ask the current question based on tier ───
  const askQuestion = useCallback((tier, animal) => {
    cancelTimers();
    setFeedbackText('');
    updateGame({ attemptNumber: 1, questionTier: tier, phase: 'respond' });

    if (tier === 'name') {
      const variants = NAME_QUESTIONS[animal.type] || NAME_QUESTIONS.animal;
      const pick = variants[Math.floor(Math.random() * variants.length)];
      speak(pick.audio, pick.text);
    } else if (tier === 'color') {
      const askWord = animal.count > 1 ? `the ${animal.plural}` : `the ${animal.word}`;
      speak(`/audio/${animal.id}-color-ask.mp3`, `What color ${animal.count > 1 ? 'are' : 'is'} ${askWord}?`);
    } else if (tier === 'count') {
      speak(`/audio/${animal.id}-count-ask.mp3`, `How many ${animal.plural} do you see?`);
    } else if (tier === 'favorite') {
      speak('/audio/favorite-ask.mp3', 'What is your favorite animal?');
    }
  }, [speak, cancelTimers, updateGame]);

  // ─── Start card (always begins with "name" tier) ───
  const startExercise = useCallback(() => {
    if (gameOverRef.current) return;
    askQuestion('name', deck[gameRef.current.exerciseIndex]);
  }, [askQuestion, deck]);

  // Handle "start" button tap
  const handleStart = useCallback(() => {
    speak('/audio/greeting.mp3', "Hello. Let's look at the pictures.");
    setTimeout(() => { setPhase('intro'); gameRef.current.phase = 'intro'; }, 2500);
  }, [speak]);

  // Auto-start on exercise change
  useEffect(() => {
    if (phase === 'intro' && !gameOverRef.current) {
      const timer = setTimeout(startExercise, 800);
      return () => clearTimeout(timer);
    }
  }, [exerciseIndex, phase, startExercise]);

  // ─── Advance: move to next tier, next card, or complete ───
  const advanceToNextCard = useCallback((delay = 2000) => {
    cancelTimers();
    advanceTimerRef.current = setTimeout(() => {
      if (gameOverRef.current) return;
      const idx = gameRef.current.exerciseIndex;
      if (idx < deck.length - 1) {
        const next = idx + 1;
        updateGame({ exerciseIndex: next, phase: 'intro' });
      } else {
        // All cards done → ask favorite question
        gameOverRef.current = true;
        updateGame({ phase: 'favorite', questionTier: 'favorite' });
        setFeedbackText('What is your favorite animal?');
        speak('/audio/favorite-ask.mp3', 'What is your favorite animal?');
      }
    }, delay);
  }, [deck.length, cancelTimers, updateGame, speak]);

  const advanceToNextTier = useCallback((currentTier, delay = 2000) => {
    cancelTimers();
    advanceTimerRef.current = setTimeout(() => {
      if (gameOverRef.current) return;
      const animal = deck[gameRef.current.exerciseIndex];
      if (currentTier === 'name') {
        askQuestion('color', animal);
      } else if (currentTier === 'color') {
        askQuestion('count', animal);
      } else {
        // After count, move to next card
        advanceToNextCard(0);
      }
    }, delay);
  }, [cancelTimers, deck, askQuestion, advanceToNextCard]);

  // Play completion audio
  useEffect(() => {
    if (phase === 'complete' && !completionPlayedRef.current) {
      completionPlayedRef.current = true;
      if (score >= Math.ceil(deck.length * 0.7)) {
        speak('/audio/complete-great.mp3', 'Great job. You did amazing today.');
      } else {
        speak('/audio/complete-good-try.mp3', 'Good try. You did amazing today.');
      }
    }
  }, [phase, speak, deck.length, score]);

  // ─── Handle speech transcript ───
  useEffect(() => {
    if (!transcriptId || !transcript || (gameOverRef.current && gameRef.current.phase !== 'favorite')) return;
    if (transcriptId <= lastProcessedTranscriptId.current) return;
    if (gameRef.current.phase !== 'respond' && gameRef.current.phase !== 'favorite') {
      console.log(`[BLOCKED] phase=${gameRef.current.phase}`);
      return;
    }
    lastProcessedTranscriptId.current = transcriptId;

    const g = gameRef.current;
    const tier = g.questionTier;
    const animal = deck[g.exerciseIndex] || deck[0];
    console.log(`[PROCESS] tier=${tier}, transcript="${transcript}", attempt=${g.attemptNumber}`);

    // ── FAVORITE (open-ended, accept any farm animal) ──
    if (tier === 'favorite') {
      const matchedAnimal = ANIMAL_POOL.find((a) => fuzzyMatch(alternatives, a.word));
      if (matchedAnimal) {
        const favPlural = matchedAnimal.plural;
        setFeedbackText(`I love ${favPlural} too! Great choice.`);
        updateGame({ phase: 'celebrate' });
        speak(`/audio/favorite-${matchedAnimal.word}.mp3`, `I love ${favPlural} too! Great choice.`);
        setTimeout(() => {
          updateGame({ phase: 'complete' });
        }, 3000);
      } else {
        // Gently re-prompt
        setFeedbackText('Tell me a farm animal you like.');
        speak('/audio/favorite-reprompt.mp3', 'Tell me a farm animal you like.');
        // Stay in favorite phase, don't increment attempts
      }
      return;
    }

    // ── Determine correct answer based on tier ──
    let isCorrect = false;
    if (tier === 'name') {
      isCorrect = fuzzyMatch(alternatives, animal.word);
    } else if (tier === 'color') {
      // For multi-word colors like "black and white", accept any component word
      const colorWords = animal.color.split(/\s+and\s+/);
      isCorrect = colorWords.some((cw) => fuzzyMatch(alternatives, cw));
    } else if (tier === 'count') {
      isCorrect = fuzzyMatchNumber(alternatives, animal.count);
    }

    // ── CORRECT ──
    if (isCorrect) {
      let audioPath, msg;
      if (tier === 'name') {
        audioPath = `/audio/${animal.id}-correct.mp3`;
        msg = animal.count > 1
          ? `Yes! These are ${animal.plural}.`
          : `Yes! This is a ${animal.word}.`;
      } else if (tier === 'color') {
        audioPath = `/audio/${animal.id}-color-correct.mp3`;
        msg = animal.count > 1
          ? `Yes! They're ${animal.color} ${animal.plural}.`
          : `Yes! It's a ${animal.color} ${animal.word}.`;
      } else {
        audioPath = `/audio/${animal.id}-count-correct.mp3`;
        const numWord = NUMBER_WORDS[animal.count]?.[0] || String(animal.count);
        msg = animal.count > 1
          ? `Yes! There are ${numWord} ${animal.plural}.`
          : `Yes! There is ${numWord} ${animal.word}.`;
      }

      setFeedbackText(msg);
      if (g.attemptNumber === 1) {
        setCorrectIds((prev) => new Set([...prev, `${animal.id}-${tier}`]));
      }
      updateGame({ phase: 'celebrate' });
      speak(audioPath, msg);

      // If correct on first try → go deeper. Otherwise skip to next card.
      if (g.attemptNumber === 1) {
        advanceToNextTier(tier, 2500);
      } else {
        advanceToNextCard(2500);
      }
      return;
    }

    // ── WRONG — max attempts reached ──
    if (g.attemptNumber >= MAX_ATTEMPTS) {
      setFeedbackText("Let's try another one.");
      updateGame({ phase: 'giveAnswer' });
      speak('/audio/lets-try-another.mp3', "Let's try another one.");
      advanceToNextCard(3500);
      return;
    }

    // ── WRONG — attempt 1 → try again ──
    if (g.attemptNumber === 1) {
      setFeedbackText('No, try again.');
      updateGame({ attemptNumber: 2, phase: 'feedback' });
      speak('/audio/try-again.mp3', 'No, try again.').then(() => {
        if (!gameOverRef.current) updateGame({ phase: 'respond' });
      });
      return;
    }

    // ── WRONG — attempt 2 → reveal answer ──
    let revealPath, revealMsg;
    if (tier === 'name') {
      revealPath = `/audio/${animal.id}-reveal.mp3`;
      revealMsg = animal.count > 1
        ? `These are ${animal.plural}. Say it with me... ${animal.word}.`
        : `This is a ${animal.word}. Say it with me... ${animal.word}.`;
    } else if (tier === 'color') {
      revealPath = `/audio/${animal.id}-color-reveal.mp3`;
      revealMsg = animal.count > 1
        ? `They're ${animal.color} ${animal.plural}. Say it with me... ${animal.color}.`
        : `It's a ${animal.color} ${animal.word}. Say it with me... ${animal.color}.`;
    } else {
      const numWord = NUMBER_WORDS[animal.count]?.[0] || String(animal.count);
      revealPath = `/audio/${animal.id}-count-reveal.mp3`;
      revealMsg = animal.count > 1
        ? `There are ${numWord} ${animal.plural}. Say it with me... ${numWord}.`
        : `There is ${numWord} ${animal.word}. Say it with me... ${numWord}.`;
    }

    setFeedbackText(revealMsg);
    updateGame({ attemptNumber: g.attemptNumber + 1, phase: 'feedback' });
    speak(revealPath, revealMsg).then(() => {
      if (!gameOverRef.current) updateGame({ phase: 'respond' });
    });
  }, [transcriptId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Mic toggle ───
  const handleMic = () => {
    if (listening) { stopListening(); }
    else { stopAudio(); startListening(); }
  };

  // ─── Restart ───
  const handleRestart = () => {
    cancelTimers();
    gameOverRef.current = false;
    completionPlayedRef.current = false;
    lastProcessedTranscriptId.current = 0;
    const newDeck = pickRandom(ANIMAL_POOL, CARDS_PER_GAME);
    setDeck(newDeck);
    Object.assign(gameRef.current, { exerciseIndex: 0, attemptNumber: 1, phase: 'intro', questionTier: 'name' });
    setExerciseIndex(0);
    setCorrectIds(new Set());
    setPhase('intro');
    setFeedbackText('');
    setAttemptNumber(1);
    setQuestionTier('name');
  };

  // ════════════════════════════════════════════════════
  // ─── START SCREEN ──────────────────────────────────
  // ════════════════════════════════════════════════════
  if (phase === 'start') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Nunito', sans-serif", position: 'relative', cursor: 'pointer' }} onClick={handleStart}>
        <FarmBackground />
        <div style={{ position: 'fixed', top: 14, left: 20, zIndex: 10 }}><LittleSpongesLogo /></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <FrogAvatar size={300} state="idle" />
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ background: `radial-gradient(circle at 35% 35%, ${BRAND.hotPink}, ${BRAND.hotPinkDark})`,
              borderRadius: 30, padding: '20px 50px', border: `4px solid ${BRAND.hotPinkDark}`,
              boxShadow: `0 8px 24px ${BRAND.hotPinkDark}60` }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 36, fontWeight: 900, color: BRAND.white }}>
              Tap to Start!
            </span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ─── COMPLETION SCREEN ─────────────────────────────
  // ════════════════════════════════════════════════════
  if (phase === 'complete') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Nunito', sans-serif", padding: 30, position: 'relative' }}>
        <FarmBackground />
        <div style={{ position: 'fixed', top: 14, left: 20, zIndex: 10 }}><LittleSpongesLogo /></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ background: 'rgba(240,240,240,0.95)', borderRadius: 30, padding: '40px 50px',
            border: `4px solid ${BRAND.cyan}`, boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            textAlign: 'center', maxWidth: 500, zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -10 }}>
            <FrogAvatar size={200} state="correct" />
          </div>
          <h1 style={{ color: BRAND.orange, fontSize: 36, fontWeight: 900, margin: '0 0 8px' }}>
            {score >= Math.ceil(deck.length * 0.7) ? 'Great Job!' : 'Good Try!'}
          </h1>
          <p style={{ color: BRAND.teal, fontSize: 24, fontWeight: 700, margin: '0 0 16px' }}>
            {score} stars earned!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 30, flexWrap: 'wrap' }}>
            {Array.from({ length: score }, (_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }} style={{ fontSize: 32 }}>⭐</motion.span>
            ))}
          </div>
          <div style={{ borderTop: '2px solid #ccc', paddingTop: 24, display: 'flex', justifyContent: 'center', gap: 30 }}>
            <RoundButton onClick={handleRestart} color={BRAND.btnGreen} darkColor={BRAND.btnGreenDark} size={80} icon="↻" label="Play Again" />
            <RoundButton onClick={() => window.close()} color={BRAND.red} darkColor={BRAND.redDark} size={80} icon="✕" label="Exit" />
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ─── FAVORITE QUESTION SCREEN ──────────────────────
  // ════════════════════════════════════════════════════
  if (phase === 'favorite') {
    return (
      <div style={{ height: '100vh', overflow: 'hidden', fontFamily: "'Nunito', sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <FarmBackground />
        <div style={{ position: 'fixed', top: 14, left: 20, zIndex: 10 }}><LittleSpongesLogo /></div>

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <StarRow score={score} />

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 28, padding: '40px 50px',
              border: `6px solid ${BRAND.gold}`, boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              textAlign: 'center', maxWidth: 500 }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>🐾</div>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 800, color: BRAND.teal, margin: '0 0 8px' }}>
              What is your favorite animal?
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, color: BRAND.gray, margin: 0 }}>
              Tell me which farm animal you like best!
            </p>
          </motion.div>

          <MicButton listening={listening} onClick={handleMic} disabled={false} />

          {transcript && (
            <div style={{ fontSize: 11, color: BRAND.gray, marginTop: 4, opacity: 0.6 }}>Heard: "{transcript}"</div>
          )}
        </div>

        <div style={{ position: 'absolute', top: 'calc(50% - 65px)', left: 'calc(50% + 220px)',
          transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, zIndex: 1 }}>
          <FrogAvatar size={500} state="idle" />
          <AnimatePresence><SpeechBubble text={feedbackText} visible={!!feedbackText} /></AnimatePresence>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // ─── MAIN GAME LAYOUT ─────────────────────────────
  // ════════════════════════════════════════════════════

  // Show which question tier we're on
  const tierLabel = questionTier === 'name' ? 'What is this?'
    : questionTier === 'color' ? `What color is the ${exercise.word}?`
    : `How many ${exercise.word}s do you see?`;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', fontFamily: "'Nunito', sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <FarmBackground />
      <div style={{ position: 'fixed', top: 14, left: 20, zIndex: 10 }}><LittleSpongesLogo /></div>

      {/* Close button */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => window.close()}
        style={{ position: 'fixed', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%',
          border: `3px solid ${BRAND.redDark}`, background: BRAND.red, color: BRAND.white,
          fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,0,0,0.2)', zIndex: 10 }}>✕</motion.button>

      {/* Card + controls centered */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 1 }}>

        <StarRow score={score} />

        {/* Question tier label above card */}
        <motion.div key={tierLabel} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: BRAND.white,
            textShadow: `2px 2px 6px ${BRAND.teal}`, textAlign: 'center' }}>
          {tierLabel}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={`${exercise.id}-${questionTier}`}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
            style={{ width: 600, height: 450, borderRadius: 28, overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: `6px solid ${BRAND.gold}`, background: BRAND.white }}>
            <img src={exercise.image} alt={exercise.word}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minHeight: 140 }}>
          {phase === 'respond' && <MicButton listening={listening} onClick={handleMic} disabled={false} />}
          {phase === 'feedback' && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ fontSize: 50 }}>🌟</motion.div>
          )}
          {phase === 'celebrate' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} style={{ fontSize: 80 }}>🎉</motion.div>
          )}
          {phase === 'giveAnswer' && <div style={{ minHeight: 50 }} />}
          {transcript && (
            <div style={{ fontSize: 11, color: BRAND.gray, marginTop: 4, opacity: 0.6 }}>Heard: "{transcript}"</div>
          )}
        </div>
      </div>

      {/* Frog */}
      <div style={{ position: 'absolute', top: 'calc(50% - 65px)', left: 'calc(50% + 260px)',
        transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, zIndex: 1 }}>
        <FrogAvatar size={500}
          state={phase === 'celebrate' ? 'correct' : phase === 'giveAnswer' ? 'tryagain' : 'idle'} />
        <AnimatePresence><SpeechBubble text={feedbackText} visible={!!feedbackText} /></AnimatePresence>
      </div>
    </div>
  );
}
