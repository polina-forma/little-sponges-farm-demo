# Little Sponges — Run Commands

Project root:
`/sessions/focused-keen-allen/mnt/Documents/02_Forma_Consulting/Client_Little_Sponges/spanish-tutor-app`

## Frontend (Vite)

```bash
npm run dev          # dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve the built dist/
```

## Backend (TTS fallback for missing audio files)

```bash
cd server
node server.js       # runs on http://localhost:3001
```

Only needed if any pre-recorded `.mp3` is missing — the app falls back to `POST /api/speak` for TTS. If the backend is off and a file is missing, you get silence.

## Handy paths

```bash
open public/audio              # pre-recorded prompts / feedback
open public/images/unit1       # animal cards — All-Farm-Animals.png goes here
open public/videos             # normalized frog clips (idle/talking/correct/tryagain)
open public/videos/_originals  # pre-normalization backups
```

## First-time setup / after pulling

```bash
npm install
cd server && npm install && cd ..
```

## Reset everything if things get weird

```bash
rm -rf node_modules dist .vite
npm install
npm run dev
```
