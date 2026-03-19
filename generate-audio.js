/**
 * Pre-generate all audio files for the Little Sponges ESL demo.
 * Uses ElevenLabs TTS with Ziggy voice (young, animated, cartoonish male).
 * Outputs .mp3 files to public/audio/
 *
 * Run: node generate-audio.js
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// ElevenLabs config
const VOICE_ID = '87n4zM8Wuy87vFILuKvE'; // Ziggy — young, animated male
const MODEL_ID = 'eleven_multilingual_v2';
const API_KEY = process.env.ELEVENLABS_API_KEY;

// Fixed 5 animals for the demo
const ANIMALS = [
  { id: 'horse', word: 'horse' },
  { id: 'cow', word: 'cow' },
  { id: 'chicken', word: 'chicken' },
  { id: 'sheep', word: 'sheep' },
  { id: 'pig', word: 'pig' },
];

// All phrases to generate
function getAllPhrases() {
  const phrases = [];

  // Opening greeting
  phrases.push({ file: 'greeting', text: "Hello! Let's look at the pictures!" });

  // Universal intro (same for every card)
  phrases.push({ file: 'what-is-this', text: 'What is this?' });

  // Universal attempt 1 wrong
  phrases.push({ file: 'try-again', text: 'No, please try again.' });

  // Per-animal phrases
  for (const { id, word } of ANIMALS) {
    // Correct
    phrases.push({ file: `${id}-correct`, text: `Yes! This is a ${word}!` });

    // Reveal (attempt 2 wrong — with pause for mic)
    phrases.push({ file: `${id}-reveal`, text: `No, this is a ${word}. Say it with me... ${word}!` });

    // Skip (attempt 3 — move on)
    phrases.push({ file: `${id}-skip`, text: `Let's try another one!` });
  }

  // Horse bonus color question
  phrases.push({ file: 'horse-color-ask', text: 'What color is the horse?' });
  phrases.push({ file: 'horse-color-correct', text: "Yes! It's a brown horse. Good job!" });
  phrases.push({ file: 'horse-color-reveal', text: 'No, the horse is brown. Say it with me... brown!' });
  phrases.push({ file: 'horse-color-skip', text: "Let's try another one!" });

  // Completion screen
  phrases.push({ file: 'complete-great', text: "Great job! You did amazing today!" });

  return phrases;
}

async function generateAudio(filename, text) {
  const outPath = path.join(AUDIO_DIR, `${filename}.mp3`);

  // Skip if already exists
  if (fs.existsSync(outPath)) {
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
          stability: 0.6,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true,
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
  console.log('\n🐸 Little Sponges Audio Generator (ElevenLabs)\n');
  console.log(`Voice: Ziggy (${VOICE_ID})`);
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Output: ${AUDIO_DIR}\n`);

  if (!API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY in .env file');
    console.error('   Add it: echo "ELEVENLABS_API_KEY=your_key_here" >> .env');
    process.exit(1);
  }

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const allPhrases = getAllPhrases();
  console.log(`Generating ${allPhrases.length} audio files...\n`);

  // Generate one at a time to stay within ElevenLabs rate limits
  for (const p of allPhrases) {
    await generateAudio(p.file, p.text);
  }

  console.log(`\n✅ Done! ${allPhrases.length} files in ${AUDIO_DIR}\n`);
}

main().catch(console.error);
