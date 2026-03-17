#!/bin/bash

# ─────────────────────────────────────────────────
# Little Sponges - Interactive Spanish Tutor
# Double-click this file to start the app!
# ─────────────────────────────────────────────────

clear
echo ""
echo "  🐸  Little Sponges — Interactive Spanish Tutor"
echo "  ───────────────────────────────────────────────"
echo ""

# Navigate to the project folder (same folder as this script)
cd "$(dirname "$0")"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "  ❌  Node.js is not installed."
    echo "  Please install it from https://nodejs.org"
    echo ""
    echo "  Press any key to close..."
    read -n 1
    exit 1
fi

echo "  ✅  Node.js found: $(node -v)"

# Check for .env file
if [ ! -f .env ]; then
    echo "  ❌  Missing .env file with your OpenAI API key."
    echo "  Create a .env file in this folder with:"
    echo "     OPENAI_API_KEY=sk-your-key-here"
    echo "     PORT=3001"
    echo ""
    echo "  Press any key to close..."
    read -n 1
    exit 1
fi

echo "  ✅  .env file found"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "  📦  Installing dependencies (first time only)..."
    echo ""
    npm install
    echo ""
fi

# Check if concurrently is installed
if [ ! -f "node_modules/.bin/concurrently" ]; then
    echo "  📦  Installing missing packages..."
    npm install
    echo ""
fi

echo "  ✅  Dependencies ready"
echo ""
echo "  🚀  Starting the app..."
echo "  ───────────────────────────────────────────────"
echo ""
echo "  The app will open in your browser automatically."
echo "  If it doesn't, go to: http://localhost:5173"
echo ""
echo "  To stop the app, close this window or press Ctrl+C"
echo ""

# Wait a moment then open the browser
(sleep 4 && open http://localhost:5173) &

# Start both servers with one command
npx concurrently \
    --names "API,APP" \
    --prefix-colors "cyan,yellow" \
    "node server.js" \
    "npx vite --open"
