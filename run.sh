#!/usr/bin/env bash
set -e

echo "========================================================"
echo "   SmartStock AI - Smart Inventory Management Platform"
echo "   BTech CSE 2nd Year AI Course Project (Team 80)"
echo "========================================================"

echo "[1/4] Checking Python environment..."
python3 --version || python --version

echo "[2/4] Verifying Python dependencies..."
python3 -m pip install -r requirements.txt --quiet || python -m pip install -r requirements.txt --quiet

echo "[3/4] Checking frontend build..."
if [ ! -f "frontend/dist/index.html" ]; then
    echo "Building frontend static bundle..."
    cd frontend
    npm install --quiet
    npm run build
    cd ..
else
    echo "Frontend build found in frontend/dist/"
fi

echo "[4/4] Starting SmartStock AI server at http://localhost:8000 ..."
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 || python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
