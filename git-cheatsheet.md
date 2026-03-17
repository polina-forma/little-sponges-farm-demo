# Git & Terminal Cheatsheet for Polina

## 🚀 First Time Setup (connect local folder to GitHub)

```bash
cd ~/Documents/little-sponges-spanish-tutor   # go to your project folder
git init                                        # initialize git
git add .                                       # stage all files
git commit -m "Initial commit"                  # save snapshot
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main                         # push to GitHub
```

---

## 📅 Daily Workflow

### Save your changes to GitHub:
```bash
git add .                           # stage all changes
git commit -m "describe what you changed"
git push                            # send to GitHub
```

### Get latest from GitHub (if someone else made changes):
```bash
git pull
```

---

## 🔍 Check Status

```bash
git status          # see what's changed
git log --oneline   # see recent commits
```

---

## 📁 Basic Terminal Navigation

| Command | What it does |
|---------|--------------|
| `cd ~/Documents` | Go to Documents folder |
| `cd folder-name` | Go into a folder |
| `cd ..` | Go up one folder |
| `ls` | List files in current folder |
| `pwd` | Show where you are |

---

## 📦 NPM Commands (for running the app)

```bash
npm install         # install dependencies (first time or after changes)
npm run dev         # start the app locally
```
Press `Ctrl + C` to stop the app.

---

## ⚡ Quick Reference

| I want to... | Command |
|--------------|---------|
| Save my work to GitHub | `git add . && git commit -m "message" && git push` |
| Start fresh from GitHub | `git clone https://github.com/USER/REPO.git` |
| See what changed | `git status` |
| Undo uncommitted changes | `git checkout .` |
| Run the app | `npm run dev` |

---

## 🆘 If Something Goes Wrong

**"Permission denied"** → You may need to set up SSH keys or use HTTPS with a token

**"Not a git repository"** → Run `git init` first

**"Merge conflict"** → Ask Claude for help with the specific error
