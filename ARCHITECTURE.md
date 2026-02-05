# Little Sponges - Interactive Spanish Tutor
## Architecture & Technical Specification

### Overview
A voice-first interactive Spanish tutoring application for kindergarten-age children (5-6 years old), aligned with ACTFL Novice Low standards. This POC focuses on the Farm Adventure unit.

---

## Recommended Tech Stack

### Frontend
| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| **React 18 + Vite** | UI Framework | Fast builds, modern tooling, easy for future devs |
| **Tailwind CSS** | Styling | Rapid prototyping, consistent design system |
| **Web Audio API** | Audio recording | Native browser support, no dependencies |

### Voice Services
| Service | Purpose | Cost Estimate | Notes |
|---------|---------|---------------|-------|
| **OpenAI Whisper API** | Speech-to-Text | ~$0.006/min | Excellent for children's voices, handles Spanish well |
| **ElevenLabs** | Text-to-Speech | ~$0.30/1K chars | Warm, natural voices perfect for kids. Alternative: OpenAI TTS ($0.015/1K chars) |

### AI Conversation
| Service | Purpose | Cost Estimate | Notes |
|---------|---------|---------------|-------|
| **Claude 3.5 Sonnet** | Conversational AI | ~$0.003/1K input, $0.015/1K output | Excellent at maintaining persona, age-appropriate responses |
| **Alternative: GPT-4o** | Conversational AI | Similar pricing | Also works well, slightly faster |

### Backend/Hosting
| Service | Purpose | Cost Estimate |
|---------|---------|---------------|
| **Vercel** | Hosting + Serverless | Free tier sufficient for POC |
| **Vercel Edge Functions** | API proxy (secure keys) | Included |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Voice     │  │   Farm      │  │    Conversation         │  │
│  │   Controls  │  │   Images    │  │    Display              │  │
│  │   (Record/  │  │   (Static   │  │    (Chat bubbles,       │  │
│  │    Stop)    │  │    assets)  │  │     encouragement)      │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                                        │
│         │ Audio Blob                                             │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVERLESS FUNCTIONS (Vercel)                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  /api/transcribe                                            ││
│  │  - Receives audio blob                                      ││
│  │  - Sends to Whisper API                                     ││
│  │  - Returns Spanish transcription                            ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  /api/chat                                                  ││
│  │  - Receives transcription + conversation history            ││
│  │  - Sends to Claude/GPT with tutor system prompt             ││
│  │  - Returns tutor response                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  /api/speak                                                 ││
│  │  - Receives text to speak                                   ││
│  │  - Sends to ElevenLabs/OpenAI TTS                           ││
│  │  - Returns audio stream                                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIs                               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐  │
│  │ Whisper API   │ │ Claude API    │ │ ElevenLabs API        │  │
│  │ (OpenAI)      │ │ (Anthropic)   │ │ (or OpenAI TTS)       │  │
│  └───────────────┘ └───────────────┘ └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Conversation Flow

```
1. App loads → Shows farm scene with animals
2. Tutor speaks (TTS): "¡Hola! Mira la granja. ¿Qué animales ves?"
3. Child presses "Talk" button
4. Child speaks in Spanish (or English)
5. Audio → Whisper API → Transcription
6. Transcription → Claude API → Tutor response
7. Response → ElevenLabs → Audio playback
8. Repeat from step 3
```

---

## Cost Estimation (Monthly)

| Usage Level | Sessions/Day | Estimated Cost |
|-------------|--------------|----------------|
| Light (testing) | 5 | ~$15/month |
| Moderate | 25 | ~$60/month |
| Heavy | 100 | ~$200/month |

*Assumes 5-minute average session, 10 exchanges per session*

---

## Security Considerations

1. **API Keys**: Never expose in frontend. Always use serverless functions as proxy.
2. **COPPA Compliance**: No personal data collected in POC. Production version needs:
   - Parental consent flow
   - No persistent user tracking without consent
   - Clear privacy policy
3. **Content Safety**: Claude/GPT system prompts enforce child-safe responses.

---

## Future Enhancements (Post-POC)

1. **User Accounts & Progress Tracking** - Save vocabulary mastery, session history
2. **Adaptive Difficulty** - Adjust based on child's responses
3. **Multiple Units** - Extend beyond Farm to all 14 adventures
4. **Image Recognition** - Child points at objects, AI identifies
5. **Pronunciation Scoring** - Detailed feedback on Spanish pronunciation
6. **Parent Dashboard** - View child's progress, session summaries
7. **Offline Mode** - Cache common interactions for low-connectivity

---

## File Structure

```
little-sponges-spanish-tutor/
├── src/
│   ├── components/
│   │   ├── FarmScene.jsx        # Main farm image display
│   │   ├── VoiceButton.jsx      # Record/stop controls
│   │   ├── ChatBubble.jsx       # Conversation display
│   │   ├── TutorAvatar.jsx      # Animated tutor character
│   │   └── EncouragementBadge.jsx
│   ├── hooks/
│   │   ├── useVoiceRecorder.js  # Audio recording logic
│   │   ├── useConversation.js   # Chat state management
│   │   └── useTTS.js            # Text-to-speech playback
│   ├── services/
│   │   ├── whisper.js           # STT API calls
│   │   ├── claude.js            # AI conversation
│   │   └── elevenlabs.js        # TTS API calls
│   ├── prompts/
│   │   └── tutor-system.js      # AI persona prompt
│   ├── assets/
│   │   └── farm/                # Farm scene images
│   ├── App.jsx
│   └── main.jsx
├── api/                         # Vercel serverless functions
│   ├── transcribe.js
│   ├── chat.js
│   └── speak.js
├── public/
├── package.json
├── vite.config.js
└── .env.example
```

---

## Getting Started

See `SETUP.md` for installation and deployment instructions.
