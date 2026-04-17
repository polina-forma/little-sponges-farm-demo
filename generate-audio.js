/**
 * Pre-generate all audio files for Little Sponges Farm Adventure.
 * Uses ElevenLabs TTS with Motivational Buddy voice (warm, upbeat male).
 * Outputs .mp3 files to public/audio/
 *
 * Run:  node generate-audio.js           (generates only missing files)
 * Run:  node generate-audio.js --force   (regenerates everything)
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const FORCE = process.argv.includes('--force');

// ElevenLabs config
const VOICE_ID = 'KNv2koIK3DrR82GVvbLh'; // Motivational Buddy — warm, upbeat male
const MODEL_ID = 'eleven_multilingual_v2';
const API_KEY = process.env.ELEVENLABS_API_KEY;

// ═══════════════════════════════════════════════════════
// Farm animals — matches ANIMAL_POOL in DemoApp.jsx
// ═══════════════════════════════════════════════════════
const ANIMALS = [
  { id: 'horse', word: 'horse', plural: 'horses', color: 'brown', count: 1 },
  { id: 'cow', word: 'cow', plural: 'cows', color: 'brown', count: 1 },
  { id: 'chicken', word: 'chicken', plural: 'chickens', color: 'black and white', count: 1 },
  { id: 'sheep', word: 'sheep', plural: 'sheep', color: 'white', count: 1 },
  { id: 'pig', word: 'pig', plural: 'pigs', color: 'pink', count: 1 },
  { id: 'duck', word: 'duck', plural: 'ducks', color: 'brown', count: 1 },
  { id: 'goose', word: 'goose', plural: 'geese', color: 'white', count: 2 },
  { id: 'rabbit', word: 'rabbit', plural: 'rabbits', color: 'brown', count: 2 },
  { id: 'turkey', word: 'turkey', plural: 'turkeys', color: 'brown', count: 1 },
];

const NUMBER_WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

// ═══════════════════════════════════════════════════════
// Build all phrases
// ═══════════════════════════════════════════════════════
function getAllPhrases() {
  const phrases = [];

  // ─── Universal phrases ───
  phrases.push({ file: 'greeting', text: "Hello! Let's look at the pictures." });
  phrases.push({ file: 'what-is-this', text: 'What is this?' });
  phrases.push({ file: 'what-animal-is-this', text: 'What animal is this?' });
  phrases.push({ file: 'what-animal-do-you-see', text: 'What animal do you see?' });
  phrases.push({ file: 'what-bird-is-this', text: 'What bird is this?' });
  phrases.push({ file: 'what-bird-do-you-see', text: 'What bird do you see?' });
  phrases.push({ file: 'try-again', text: 'No, try again.' });
  phrases.push({ file: 'lets-try-another', text: "Let's try another one." });
  phrases.push({ file: 'complete-great', text: "Great job! You did amazing today." });
  phrases.push({ file: 'complete-good-try', text: "Good try! You did amazing today." });

  // ─── Favorite question (2-attempt flow) ───
  // Try 1 wrong → classified rejection + re-prompt
  // Try 2 wrong → hint with a fixed pair (cow / horse)
  // Try 3+     → graceful wrap-up
  phrases.push({ file: 'favorite-ask', text: 'What is your favorite farm animal?' });
  phrases.push({ file: 'favorite-not-farm', text: "That's not a farm animal. What is your favorite farm animal?" });
  phrases.push({ file: 'favorite-not-animal', text: "That's not an animal. What is your favorite farm animal?" });
  phrases.push({ file: 'favorite-hint', text: "Let's pick together. How about a cow or a horse?" });
  phrases.push({ file: 'favorite-wrapup', text: "That's okay. Let's keep exploring!" });

  // Per-animal favorite responses (use proper plurals)
  for (const { word, plural } of ANIMALS) {
    phrases.push({ file: `favorite-${word}`, text: `I love ${plural} too! Great choice.` });
  }

  // ─── Per-animal: 3 tiers of questions ───
  for (const { id, word, plural, color, count } of ANIMALS) {
    const numWord = NUMBER_WORDS[count] || String(count);
    const isSingular = count === 1;

    // Tier 1: Name identification
    if (isSingular) {
      phrases.push({ file: `${id}-correct`, text: `Yes! This is a ${word}.` });
      phrases.push({ file: `${id}-reveal`, text: `This is a ${word}. Say it with me... ${word}.` });
    } else {
      phrases.push({ file: `${id}-correct`, text: `Yes! These are ${plural}.` });
      phrases.push({ file: `${id}-reveal`, text: `These are ${plural}. Say it with me... ${word}.` });
    }

    // Tier 2: Color question
    if (isSingular) {
      phrases.push({ file: `${id}-color-ask`, text: `What color is the ${word}?` });
      phrases.push({ file: `${id}-color-correct`, text: `Yes! It's a ${color} ${word}.` });
      phrases.push({ file: `${id}-color-reveal`, text: `It's a ${color} ${word}. Say it with me... ${color}.` });
    } else {
      phrases.push({ file: `${id}-color-ask`, text: `What color are the ${plural}?` });
      phrases.push({ file: `${id}-color-correct`, text: `Yes! They're ${color} ${plural}.` });
      phrases.push({ file: `${id}-color-reveal`, text: `They're ${color} ${plural}. Say it with me... ${color}.` });
    }

    // Tier 3: Counting question
    phrases.push({ file: `${id}-count-ask`, text: `How many ${plural} do you see?` });
    if (isSingular) {
      phrases.push({ file: `${id}-count-correct`, text: `Yes! There is ${numWord} ${word}.` });
      phrases.push({ file: `${id}-count-reveal`, text: `There is ${numWord} ${word}. Say it with me... ${numWord}.` });
    } else {
      phrases.push({ file: `${id}-count-correct`, text: `Yes! There are ${numWord} ${plural}.` });
      phrases.push({ file: `${id}-count-reveal`, text: `There are ${numWord} ${plural}. Say it with me... ${numWord}.` });
    }
  }

  return phrases;
}

// ═══════════════════════════════════════════════════════
// Audio generation
// ═══════════════════════════════════════════════════════
async function generateAudio(filename, text) {
  const outPath = path.join(AUDIO_DIR, `${filename}.mp3`);

  if (!FORCE && fs.existsSync(outPath)) {
    console.log(`  ✓ ${filename}.mp3 (exists, skipping)`);
    return;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.90,
          similarity_boost: 0.70,
          style: 0.0,
          use_speaker_boost: false,
          speed: 0.85,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outPath, buffer);
    console.log(`  ✓ ${filename}.mp3 (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`  ✗ ${filename}.mp3 FAILED: ${err.message}`);
  }
}

async function main() {
  console.log('\n🐸 Little Sponges Audio Generator — Farm Adventure\n');
  console.log(`Voice: Motivational Buddy (${VOICE_ID})`);
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Speed: 0.85 (slightly slower for young learners)`);
  console.log(`Output: ${AUDIO_DIR}`);
  console.log(`Mode: ${FORCE ? 'FORCE (regenerating all)' : 'incremental (skipping existing)'}\n`);

  if (!API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY in .env file');
    console.error('   Add it: echo "ELEVENLABS_API_KEY=your_key_here" >> .env');
    process.exit(1);
  }

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const allPhrases = getAllPhrases();
  const toGenerate = FORCE
    ? allPhrases.length
    : allPhrases.filter((p) => !fs.existsSync(path.join(AUDIO_DIR, `${p.file}.mp3`))).length;

  console.log(`Total phrases: ${allPhrases.length}`);
  console.log(`To generate: ${toGenerate}\n`);

  // Print all phrases for review
  console.log('── All phrases ──');
  for (const p of allPhrases) {
    const exists = fs.existsSync(path.join(AUDIO_DIR, `${p.file}.mp3`));
    console.log(`  ${exists && !FORCE ? '◻' : '▸'} ${p.file}: "${p.text}"`);
  }
  console.log('');

  if (toGenerate === 0) {
    console.log('✅ All audio files already exist. Use --force to regenerate.');
    return;
  }

  let generated = 0;
  for (const p of allPhrases) {
    await generateAudio(p.file, p.text);
    generated++;
    if (generated % 20 === 0) {
      console.log(`\n  ... ${generated}/${allPhrases.length} processed ...\n`);
    }
  }

  console.log(`\n✅ Done! ${allPhrases.length} phrases processed, ${toGenerate} generated.\n`);
}

main().catch(console.error);
