# Setup Guide - Little Sponges Spanish Tutor

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your API keys
nano .env.local  # or open in any editor
```

### 3. Get API Keys

**Required:**
- **OpenAI API Key** (for Whisper speech-to-text): [Get key](https://platform.openai.com/api-keys)

**Choose one for AI conversation:**
- **Anthropic API Key** (Claude - recommended): [Get key](https://console.anthropic.com/)
- Or use OpenAI for both STT and chat

**Optional (for premium voice):**
- **ElevenLabs API Key**: [Get key](https://elevenlabs.io/)

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/little-sponges-tutor.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY` (optional)
5. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

---

## Configuration Options

### AI Provider

In `.env.local`:

```bash
# Use Claude (recommended - better at maintaining child-friendly persona)
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OR use OpenAI GPT-4
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxx
```

### Text-to-Speech

```bash
# Free (uses browser's built-in speech)
VITE_TTS_PROVIDER=browser

# Premium quality (ElevenLabs - most natural)
VITE_TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=xxxxx

# Good quality (OpenAI TTS)
VITE_TTS_PROVIDER=openai
```

---

## Cost Estimates

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **Whisper** (STT) | 100 sessions × 5 min | ~$3 |
| **Claude Sonnet** | 100 sessions × 10 exchanges | ~$5 |
| **ElevenLabs** (TTS) | 100 sessions | ~$15-30 |
| **Vercel Hosting** | - | Free tier |
| **Total (light use)** | | ~$20-40/month |

For heavy usage (500+ sessions/month), budget ~$100-200/month.

---

## Testing Without APIs

The app includes demo mode fallbacks. If API calls fail, it will:
1. Use demo transcriptions
2. Return pre-written tutor responses
3. Fall back to browser TTS

This lets you test the UI flow without API costs.

---

## Customization

### Adding New Vocabulary Units

Edit `src/prompts/tutor-system.js`:

```javascript
// Add new vocabulary section
## BEACH ADVENTURE VOCABULARY

### Beach Items: la playa, el mar, la arena, el sol, la ola...
```

### Changing the Tutor Persona

The AI personality is fully controlled by the system prompt in `src/prompts/tutor-system.js`. Adjust tone, vocabulary restrictions, and response patterns there.

### Swapping Farm Images

Replace the emoji-based farm scene in `src/components/FarmScene.jsx` with:
- Static images from Little Sponges brand assets
- SVG illustrations
- Actual photographs (like the real Little Sponges videos use)

### Adding More Languages

The architecture supports any language. Update:
1. System prompt vocabulary
2. Whisper language hint in `/api/transcribe.js`
3. TTS voice selection in `/api/speak.js`

---

## Troubleshooting

### "Microphone access denied"
- Ensure HTTPS (required for mic access in browsers)
- Check browser permissions
- On mobile, some browsers restrict mic access in iframes

### "API key invalid"
- Double-check key in `.env.local`
- Ensure no extra spaces
- Verify key has correct permissions

### "Transcription returns wrong language"
- Whisper auto-detects language; hint helps but doesn't force
- Kids mixing English/Spanish is expected and handled by the tutor prompt

### Voice not working
- Browser TTS requires user interaction first (click the button)
- Some browsers have limited Spanish voice options
- ElevenLabs/OpenAI TTS are more reliable

---

## Security Checklist

Before going to production:

- [ ] API keys are in environment variables (not committed to git)
- [ ] `.env.local` is in `.gitignore`
- [ ] Vercel serverless functions proxy all API calls
- [ ] No PII is collected (COPPA compliance)
- [ ] Rate limiting is configured (prevent abuse)

---

## Next Steps for Production

1. **Integrate with Little Sponges Platform**
   - Add OAuth/SSO from main platform
   - Sync user progress with existing LMS

2. **Add Progress Tracking**
   - Store session history
   - Track vocabulary mastery
   - Generate reports for parents/teachers

3. **Enhance Voice Experience**
   - Pronunciation scoring (Azure Speech or Google Speech)
   - Voice activity detection (auto-stop recording)
   - Background noise cancellation

4. **Mobile App**
   - Wrap in Capacitor/React Native
   - Add offline mode with cached conversations

---

## Support

For questions about this POC, contact Polina.
For Little Sponges curriculum questions, contact Natalia.
