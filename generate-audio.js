/**
 * Pre-generate all audio files for the Little Sponges ESL demo.
 * Uses OpenAI TTS-1 with 'echo' voice (male, frog character).
 * Outputs .mp3 files to public/audio/
 *
 * Run: node generate-audio.js
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// All animal words used in the demo
const ANIMALS = [
  { id: 'turtle', word: 'turtle', plural: false },
  { id: 'duck', word: 'duck', plural: false },
  { id: 'turkey', word: 'turkey', plural: false },
  { id: 'chicken', word: 'chicken', plural: false },
  { id: 'geese', word: 'geese', plural: true },
  { id: 'cow', word: 'cow', plural: false },
  { id: 'horse', word: 'horse', plural: false },
  { id: 'sheep', word: 'sheep', plural: false },
  { id: 'pig', word: 'pig', plural: false },
  { id: 'cat', word: 'cat', plural: false },
  { id: 'rabbits', word: 'rabbits', plural: true },
  { id: 'dogs', word: 'dogs', plural: true },
  { id: 'bees', word: 'bees', plural: true },
  { id: 'grey-mouse', word: 'mouse', plural: false },
  { id: 'brown-horse', word: 'horse', plural: false },
];

// Generic intro phrases (not per-animal)
const INTRO_PHRASES = [
  { file: 'intro-singular-1', text: 'What is this animal? Can you tell me?' },
  { file: 'intro-singular-2', text: 'Ooh, look at this! What animal do you see?' },
  { file: 'intro-singular-3', text: 'Hey, who is this? Do you know?' },
  { file: 'intro-singular-4', text: 'Wow! What animal is this? Tell me!' },
  { file: 'intro-singular-5', text: 'Look at this picture! What is it?' },
  { file: 'intro-singular-6', text: 'What do we have here? What animal is this?' },
  { file: 'intro-plural-1', text: 'What are these animals? Can you tell me?' },
  { file: 'intro-plural-2', text: 'Ooh, look! What animals do you see?' },
  { file: 'intro-plural-3', text: 'Hey, who are these? Do you know?' },
  { file: 'intro-plural-4', text: 'Wow! What animals are these? Tell me!' },
  { file: 'intro-plural-5', text: 'Look at this picture! What are they?' },
  { file: 'intro-plural-6', text: 'What do we have here? What animals are these?' },
];

// Per-animal phrases
function getAnimalPhrases(animal) {
  const { id, word, plural } = animal;
  const article = plural ? '' : 'a ';
  const thisIs = plural ? `These are ${word}` : `This is ${article}${word}`;

  return [
    // Correct — 3 varied celebrations per word
    { file: `${id}-correct-1`, text: `Yes! Great job! You said ${word} perfectly!` },
    { file: `${id}-correct-2`, text: `Awesome! That's right, it's ${article}${word}! You're so smart!` },
    { file: `${id}-correct-3`, text: `Wow, you got it! ${word}! Amazing!` },

    // Reveal (attempt 1 wrong → show the word)
    { file: `${id}-reveal`, text: `${thisIs}. Repeat after me: ${word}!` },

    // Encourage (attempt 2 wrong → one more try)
    { file: `${id}-encourage`, text: `Almost! Say it with me: ${word}!` },

    // Skip (attempt 3 → move on)
    { file: `${id}-skip`, text: `Good try! ${thisIs}. Let's try another one!` },
  ];
}

// Completion screen
const COMPLETION_PHRASES = [
  { file: 'complete-great', text: "Great job! You did amazing today! I'm so proud of you!" },
];

async function generateAudio(filename, text) {
  const outPath = path.join(AUDIO_DIR, `${filename}.mp3`);

  // Skip if already exists
  if (fs.existsSync(outPath)) {
    console.log(`  ✓ ${filename}.mp3 (exists)`);
    return;
  }

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'echo',
      input: text,
      speed: 0.82,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(outPath, buffer);
    console.log(`  ✓ ${filename}.mp3 (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`  ✗ ${filename}.mp3 FAILED: ${err.message}`);
  }
}

async function main() {
  console.log('\n🐸 Little Sponges Audio Generator\n');
  console.log(`Output: ${AUDIO_DIR}\n`);

  // Collect all phrases
  const allPhrases = [];

  // Intros
  allPhrases.push(...INTRO_PHRASES);

  // Per-animal
  const uniqueWords = new Set();
  for (const animal of ANIMALS) {
    // Skip duplicate words (horse appears twice)
    const key = animal.id;
    if (key === 'brown-horse') continue; // same word as 'horse', reuse audio
    allPhrases.push(...getAnimalPhrases(animal));
  }

  // Completion
  allPhrases.push(...COMPLETION_PHRASES);

  console.log(`Generating ${allPhrases.length} audio files...\n`);

  // Generate in batches of 5 to avoid rate limits
  for (let i = 0; i < allPhrases.length; i += 5) {
    const batch = allPhrases.slice(i, i + 5);
    await Promise.all(batch.map(p => generateAudio(p.file, p.text)));
  }

  console.log(`\n✅ Done! ${allPhrases.length} files in ${AUDIO_DIR}\n`);
}

main().catch(console.error);
