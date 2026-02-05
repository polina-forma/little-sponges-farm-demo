/**
 * /api/transcribe - Speech-to-Text endpoint
 *
 * Receives audio blob from frontend, sends to Whisper API,
 * returns Spanish transcription.
 *
 * Deploy: Vercel, Netlify, or any Node.js serverless platform
 */

// For Vercel Edge Functions (recommended for speed)
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get audio from request
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare for Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'es'); // Expect Spanish, but will transcribe English too
    whisperFormData.append('prompt', 'This is a young child speaking simple Spanish words about farm animals, colors, and numbers. Common words: vaca, cerdo, pollo, caballo, oveja, pato, perro, gato, rojo, azul, verde, amarillo, uno, dos, tres.');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: whisperFormData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      throw new Error('Transcription failed');
    }

    const result = await response.json();

    return new Response(JSON.stringify({
      transcription: result.text,
      language: 'es'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Transcription error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to transcribe audio',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Alternative: Node.js runtime version (for non-Edge deployment)
 *
 * Uncomment this and comment out the Edge version above if needed.
 */
/*
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({});
  const [fields, files] = await form.parse(req);
  const audioFile = files.audio?.[0];

  if (!audioFile) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.filepath),
      model: 'whisper-1',
      language: 'es',
      prompt: 'Young child speaking simple Spanish: vaca, cerdo, pollo, uno, dos, tres'
    });

    res.status(200).json({ transcription: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
}
*/
