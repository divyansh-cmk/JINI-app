#!/bin/bash
# Move to the script's directory
cd "$(dirname "$0")"

echo "==========================================="
echo "   🚀 Starting JINI AI Companion App...   "
echo "==========================================="

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "⚠️ Node.js / npm not found! Please install Node.js from https://nodejs.org/"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if node_modules exists, install if missing
if [ ! -d "node_modules" ]; then
    echo "📦 Initializing node modules... (this may take a moment)"
    npm install
fi

# Start the Express server in the background
npm start &
SERVER_PID=$!

# Wait 2 seconds for the server to spin up
sleep 2

# Open JINI in the browser
open "http://localhost:8080/index.html"

# Keep terminal alive to view server logs
echo "==========================================="
echo "🟢 JINI is live at http://localhost:8080/"
echo "Keep this window open while using JINI."
echo "Press Ctrl+C to stop the server."
echo "==========================================="

wait $SERVER_PID
