# Little Sponges® — Client & Project Reference

## About the Company

**Little Sponges®** is a research-based online language education platform for children ages 3–12, founded in 2014 by **Natalya Seals** and based in Woodstock, Georgia. The company has been operating for 12 years.

### Languages Offered
Seven languages: English, Spanish, Chinese, French, German, Russian, and Arabic.

### Grade Levels
Pre-K through 5th grade (ages 3–12).

### Program Model
Little Sponges uses a dual-immersion method (Bilingual Immersion™) with real video footage of real people and places — not cartoons. Thematic units introduce functional language and academic vocabulary across science, math, social studies, and health, so language time also builds content knowledge. Each adventure takes students through settings like a garden, farm, school, ocean, space, concert, dentist, playground, and more.

### Use Cases
- Dual Language programs (50/50 and 90/10)
- ESL pull-out/push-in
- Newcomer supports
- Elementary World Language rotations (FLES)
- Private and public schools, preschools, summer and after-school programs
- District-wide implementations across multiple campuses

### Proven Results
- **300% acceleration** in language acquisition (Cincinnati Country Day School study)
- **111% increase** in Spanish proficiency in one school year (FLES program)
- Significant growth for emergent bilinguals after just 6 months

### Reach
- [X] active students (Natalya to fill in)
- [X] schools and programs served (Natalya to fill in)
- Serves schools across the U.S.

### Website
www.little-sponges.com

---

## AI Interactive Tutor Project

### What We're Building
An AI-powered interactive speaking tutor that guides children through vocabulary exercises using voice. The child sees a picture, hears a teacher prompt, and speaks the word in the target language. The AI listens, evaluates, and gives real-time feedback.

### Current State (POC — Farm Adventure, Unit 1)
A working prototype with 23 farm-themed exercises using real images from Little Sponges curriculum.

### Tech Stack (Current)
| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | React 18 + Vite 5 | Single-page app |
| Styling | Tailwind CSS + Framer Motion | Brand colors, animations |
| Text-to-Speech | OpenAI TTS-1-HD | "nova" voice, speed 0.85 |
| Speech-to-Text | Web Speech API (browser-native) | Free, lang: es-ES |
| AI Evaluation | OpenAI GPT-4o-mini | Child-friendly answer evaluation |
| Backend | Express.js proxy server (port 3001) | Protects API key |
| Images | Static .png files in public/images/unit1/ | 23 real curriculum images |

### How It Works
1. App shows a picture (e.g., a cow) with the Spanish word below it ("la vaca")
2. Owl avatar teacher asks the child to say the word in Spanish (AI-generated voice)
3. Child taps the microphone and speaks
4. Browser speech recognition captures what the child said
5. GPT-4o-mini evaluates accuracy and generates encouraging feedback
6. If correct → celebration, move to next word
7. If wrong → encourage retry (up to 3 attempts), then give the answer and ask child to repeat

### Retry Logic
- **Attempt 1-2:** Encouraging feedback, invite to try again
- **Attempt 3:** GPT gives the correct answer and asks the child to repeat it
- **attemptNumber** is passed to the server so GPT adapts its prompting

### Unit 1 Exercises (23 items)
All images are .png files in `public/images/unit1/`:

| Image File | English | Spanish |
|-----------|---------|---------|
| Cow.png | cow | la vaca |
| Chicken.png | chicken | el pollo |
| Horse.png | horse | el caballo |
| Pig.png | pig | el cerdo |
| Sheep.png | sheep | la oveja |
| Duck.png | duck | el pato |
| Cat.png | cat | el gato |
| Dogs.png | dogs | los perros |
| Rabbits.png | rabbits | los conejos |
| Turkey.png | turkey | el pavo |
| Turtle.png | turtle | la tortuga |
| Geese.png | geese | los gansos |
| Grey Mouse.png | grey mouse | el ratón gris |
| Brown Horse.png | brown horse | el caballo marrón |
| Bees.png | bees | las abejas |
| Bread.png | bread | el pan |
| Eggs.png | eggs | los huevos |
| White Egg.png | white egg | el huevo blanco |
| Milk.png | milk | la leche |
| Honey.png | honey | la miel |
| Wheat.png | wheat | el trigo |
| Farm.png | farm | la granja |
| Kiss.png | kiss | el beso |

### Brand
| Element | Value |
|---------|-------|
| Gold | #F7AD00 |
| Teal | #05544B |
| Cyan | #5BC0DE |
| Cream | #FFF9EC |
| Font | Nunito |
| Avatar | Owl emoji (🦉) in gold circle |

### Project Location
`~/dev/little-sponges-spanish-tutor`

### Running the App
**Terminal 1 — API server:**
```
cd ~/dev/little-sponges-spanish-tutor
node server.js
```

**Terminal 2 — Vite dev server:**
```
cd ~/dev/little-sponges-spanish-tutor
npm run dev
```

Open `http://localhost:5173` in the browser.

### Environment Variables (.env — gitignored)
```
OPENAI_API_KEY=sk-...
PORT=3001
```

---

## Next Steps / Roadmap

### Immediate
- [ ] Push to GitHub
- [ ] Test end-to-end with children
- [ ] Install `concurrently` for single start command

### Short-term
- [ ] AI-generated talking avatar (HeyGen LiveAvatar or alternative) — inquiry sent
- [ ] Fully dynamic teacher prompts (GPT-generated introductions, not templated)
- [ ] Additional units beyond Farm Adventure
- [ ] Multi-language support (expand from Spanish to all 7 languages)

### Medium-term
- [ ] User accounts and progress tracking
- [ ] Adaptive difficulty based on child's performance
- [ ] Parent/teacher dashboard
- [ ] Pronunciation scoring
- [ ] LMS integration (Canvas, Google Classroom, Blackboard)

### Long-term
- [ ] All 14+ thematic adventures
- [ ] Image recognition (child points at objects)
- [ ] Offline mode for low-connectivity schools
- [ ] COPPA-compliant production deployment

---

## Key Files

| File | Purpose |
|------|---------|
| `src/DemoApp.jsx` | Main app component (UI, exercise flow, retry logic) |
| `server.js` | Express proxy server (TTS, evaluation endpoints) |
| `.env` | API keys (gitignored) |
| `public/images/unit1/` | 23 farm unit images (.png) |
| `ARCHITECTURE.md` | Original technical architecture spec |
| `SETUP.md` | Installation instructions |
| `heygen-inquiry-email.md` | Draft enterprise pricing email to HeyGen |
