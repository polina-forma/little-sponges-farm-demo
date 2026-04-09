# Little Sponges — Changes To Do

## UI Fixes
- [x] Fix image container: change from square to landscape rectangle matching actual image ratio (~3:2)
- [ ] General UI polish / layout tweaks based on testing feedback

## Avatar
- [ ] Replace owl emoji avatar with Frog character (waiting on PNG from Natalya)
- [ ] Create Kling animated clips for frog (hop, wave, idle, celebrate)
- [ ] Wire frog video clips into app — swap based on game state (idle, listening, correct, retry, celebrate)
- [ ] Future: add real person avatar option (HeyGen — inquiry sent)

## Voice & AI
- [x] Stream TTS audio for faster playback (start playing while still downloading)
- [ ] Make teacher prompts fully dynamic (GPT-generated intros, not templated)
- [ ] Confirm tts-1-hd voice quality is acceptable (was robotic with tts-1)

## Functionality
- [x] Auto-advance to next word after 3 unsuccessful attempts (gives answer, waits 3 sec, moves on)
- [ ] Add more units beyond Farm Adventure (Unit 1)
- [ ] Multi-language support (expand from Spanish to all 7 languages)
- [ ] User accounts and progress tracking
- [ ] Parent/teacher dashboard

## Follow-ups from Demo (March 24, 2026)
- [x] Send ElevenLabs link to Natalya (elevenlabs.io) — drafted in Gmail
- [ ] Frog "not talking" clip — troubleshoot / create clip of frog in idle/non-speaking state
- [ ] Natalya to send curriculum content (waiting on her)

## Deployment
- [ ] Push to GitHub
- [ ] Run `npm install` to install concurrently
- [ ] Test `Start Little Sponges.command` one-click launcher
- [ ] Test on Natalya's computer before conference
- [ ] COPPA compliance for production
