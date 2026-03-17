import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === GENERATE INTRO PROMPT (AI-varied each time) ===
// NOTE: This endpoint is no longer called by the client (local templates used instead),
// but kept for potential future use with English ESL flow.
app.post('/api/intro', async (req, res) => {
  try {
    const { word, plural } = req.body;

    const systemPrompt = `You are a super warm, excited English teacher for young ESL learners (ages 3-12).
You're showing them a picture of an animal and asking them to identify it in English.
The correct English word is: "${word}".

Generate a short, fun, excited prompt asking the child "What is this?" WITHOUT revealing the word.
Be varied and creative each time — use different phrases, exclamations, silly sounds.
Keep it to 1-2 short sentences max. Use simple English words.
Do NOT say the answer word "${word}" in your prompt.

${plural ? 'The image shows multiple animals, so use "these" instead of "this".' : ''}

Examples of variety:
- "Ooh, look at this! What animal do you see?"
- "Hey, who is this? Do you know?"
- "Wow! What animal is this? Tell me!"

Respond in JSON: {"prompt": "your message"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Word: "${word}", plural: ${plural}. Generate a fun intro without revealing the word!` },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.0,
      max_tokens: 120,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error('Intro error:', err.message);
    res.status(500).json({ error: 'Intro generation failed' });
  }
});

// === EVALUATE SPOKEN ANSWER ===
app.post('/api/evaluate', async (req, res) => {
  try {
    const { spokenText, alternatives = [], targetWord, attemptNumber } = req.body;

    // Format all alternatives for GPT to check
    const allGuesses = alternatives.length > 0
      ? alternatives.map((a, i) => `  ${i + 1}. "${a}"`).join('\n')
      : `  1. "${spokenText}"`;

    let systemPrompt;
    if (attemptNumber >= 3) {
      systemPrompt = `You are a super warm, gentle English teacher for young ESL learners (ages 3-12).
The child tried to say "${targetWord}" in English but is having a hard time. That's okay!
Give the answer in a very encouraging way. Use simple, short words.
Make them feel proud for trying!

CRITICAL: The EXACT correct word is "${targetWord}" — always use this EXACTLY.

TONE: Like a kind, fun teacher. Keep it to 1 very short sentence. Be creative and varied!

IMPORTANT: Always set "correct" to false and "giveAnswer" to true.
Respond in JSON: {"correct": false, "feedback": "your message", "giveAnswer": true}`;
    } else {
      systemPrompt = `You are a super warm, gentle English teacher for young ESL learners (ages 3-12).
The child is trying to say "${targetWord}" in English.

The speech recognition captured these possible interpretations (check ALL of them):
${allGuesses}

CRITICAL: The EXACT correct word is "${targetWord}" — always use this EXACTLY in your response.

EVALUATION RULES — be EXTREMELY forgiving:
- Check ALL alternatives above, not just the first one. If ANY is close, mark correct.
- Accept ANY recognizable attempt at the word
- Accept phonetic similarities: "hors"="horse", "turle"="turtle", "chiken"="chicken", "duk"="duck"
- For short words (cow, pig, cat, dog): if the child said ANYTHING containing those sounds, mark correct
- Speech recognition often garbles children's speech — give massive benefit of the doubt
- When in doubt, mark it CORRECT. These are young ESL learners — any attempt deserves celebration.
- If correct: celebrate! Be creative and varied — different excited phrases each time!
- If clearly wrong (completely different word): be gentle, encourage retry. 1 short sentence.
- Respond in English and include "${targetWord}" naturally

Respond in JSON: {"correct": boolean, "feedback": "your message", "giveAnswer": false}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `The child said: "${spokenText}". Alternatives: [${alternatives.join(', ')}]. Target: "${targetWord}".` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 150,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error('Evaluate error:', err.message);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

// === TEXT-TO-SPEECH ===
app.post('/api/speak', async (req, res) => {
  try {
    const { text, voice = 'echo' } = req.body;

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',            // Standard model — much faster response time
      voice: voice,              // echo = friendly male voice (frog character)
      input: text,
      speed: 0.82,               // slower for young ESL learners
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    console.error('TTS error:', err.message);
    res.status(500).json({ error: 'TTS failed' });
  }
});

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'tts-1', voice: 'echo' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  Little Sponges API server running on http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    POST /api/evaluate  — Evaluate spoken answer (GPT-4o-mini)`);
  console.log(`    POST /api/speak     — Text-to-speech (OpenAI TTS-1 Echo)`);
  console.log(`    GET  /api/health    — Health check\n`);
});
