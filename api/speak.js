/**
 * /api/speak - Text-to-Speech endpoint
 *
 * Receives text, converts to speech using ElevenLabs or OpenAI TTS,
 * returns audio stream.
 *
 * Providers:
 * - elevenlabs: Best quality, most natural (recommended)
 * - openai: Good quality, faster, more affordable
 */

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
    const { text, provider = 'elevenlabs' } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let audioResponse;

    if (provider === 'openai') {
      audioResponse = await generateOpenAITTS(text);
    } else {
      audioResponse = await generateElevenLabsTTS(text);
    }

    // Return audio stream
    return new Response(audioResponse, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('TTS error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to generate speech',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * ElevenLabs TTS
 *
 * Voice recommendations for child-friendly Spanish tutor:
 * - "Rachel" - Warm, friendly, clear
 * - "Domi" - Young, energetic
 * - Custom clone of a bilingual speaker
 *
 * Get voice IDs: https://api.elevenlabs.io/v1/voices
 */
async function generateElevenLabsTTS(text) {
  // Default to a friendly female voice
  // You should replace this with your preferred voice ID
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // "Rachel"

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Supports Spanish
        voice_settings: {
          stability: 0.75,        // Slightly more consistent for clarity
          similarity_boost: 0.75,
          style: 0.4,             // Some expressiveness for engagement
          use_speaker_boost: true
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('ElevenLabs error:', error);
    throw new Error('ElevenLabs TTS failed');
  }

  return response.body;
}

/**
 * OpenAI TTS
 *
 * Voice options:
 * - "alloy" - Neutral
 * - "echo" - Male
 * - "fable" - British male
 * - "onyx" - Deep male
 * - "nova" - Female (recommended for friendly tutor)
 * - "shimmer" - Female, expressive
 */
async function generateOpenAITTS(text) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'tts-1',           // Use 'tts-1-hd' for higher quality
      input: text,
      voice: 'nova',            // Friendly female voice
      speed: 0.9,               // Slightly slower for kids
      response_format: 'mp3'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI TTS error:', error);
    throw new Error('OpenAI TTS failed');
  }

  return response.body;
}

/**
 * Cost comparison (as of 2024):
 *
 * ElevenLabs:
 * - Starter: $5/mo for 30K characters
 * - Creator: $22/mo for 100K characters
 * - Best quality, most natural voices
 *
 * OpenAI TTS:
 * - tts-1: $0.015 per 1K characters
 * - tts-1-hd: $0.030 per 1K characters
 * - Good quality, very fast, predictable pricing
 *
 * For a POC with moderate testing, OpenAI is likely more economical.
 * For production with quality priority, ElevenLabs is superior.
 */
