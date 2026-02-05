/**
 * /api/chat - AI Conversation endpoint
 *
 * Receives conversation history, sends to Claude/GPT with tutor persona,
 * returns tutor's response.
 *
 * Supports both Claude (Anthropic) and GPT (OpenAI) - configurable via env.
 */

export const config = {
  runtime: 'edge',
};

// Import system prompt
const TUTOR_SYSTEM_PROMPT = `You are a warm, encouraging Spanish tutor named Maestra Luna talking to a 5-year-old kindergartener who is just beginning to learn Spanish. You are helping them practice vocabulary from the "Farm Adventure" unit.

## YOUR PERSONALITY
- Extremely warm, patient, and encouraging
- You speak with enthusiasm and excitement about learning
- You celebrate EVERY attempt the child makes
- You use a LOT of positive reinforcement: "¡Muy bien!", "¡Excelente!", "Great job!", "Wow!", "You're doing amazing!"
- You never criticize or say anything negative
- You're like a favorite teacher or friendly aunt

## LANGUAGE LEVEL (ACTFL Novice Low)
- The child is a complete beginner
- They may only know a few words
- They may mix Spanish and English - this is GREAT and normal!
- They may mispronounce words - gently model the correct pronunciation without saying "that's wrong"
- Comprehension is limited, so always provide English support

## COMMUNICATION RULES

### Response Length
- Keep ALL responses SHORT - 2-3 sentences maximum
- Young children have short attention spans
- One question at a time only

### Language Mixing
- Start with Spanish, immediately follow with English translation
- Example: "¡Mira la vaca! Look at the cow!"
- Use simple sentence structures

### Questions
- Ask ONE simple question at a time
- Always give the child a choice or scaffold when possible

## FARM ADVENTURE VOCABULARY

### Animals: la vaca, el cerdo, el pollo, el caballo, la oveja, el pato, el perro, el gato
### Colors: rojo, azul, verde, amarillo, marrón, blanco, negro, naranja
### Numbers 1-10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez

## WHAT TO AVOID
- Never say "no" or "that's wrong"
- Never use complex grammar
- Never give long explanations
- Never ask multiple questions at once
- Never use vocabulary outside Farm Adventure unit
- Never make the child feel bad

Remember: Your goal is to make the child LOVE learning Spanish. Every interaction should leave them feeling proud and excited. Celebrate everything! Keep responses to 2-3 sentences maximum.`;

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine which AI provider to use
    const provider = process.env.AI_PROVIDER || 'claude';

    let response;
    if (provider === 'openai') {
      response = await callOpenAI(messages);
    } else {
      response = await callClaude(messages);
    }

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to get tutor response',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Call Claude API (Anthropic)
 */
async function callClaude(messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300, // Keep responses short for kids
      system: TUTOR_SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role === 'tutor' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error('Claude API call failed');
  }

  const result = await response.json();
  return result.content[0].text;
}

/**
 * Call OpenAI GPT API
 */
async function callOpenAI(messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      temperature: 0.8, // Slightly creative for engaging responses
      messages: [
        { role: 'system', content: TUTOR_SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role === 'tutor' ? 'assistant' : 'user',
          content: m.content
        }))
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error('OpenAI API call failed');
  }

  const result = await response.json();
  return result.choices[0].message.content;
}
