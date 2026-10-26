@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo    SmartStock AI - Smart Inventory Management Platform
echo    BTech CSE 2nd Year AI Course Project (Team 80)
echo ========================================================

echo [1/4] Checking Python environment...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo [2/4] Verifying Python dependencies...
python -m pip install -r requirements.txt --quiet

echo [3/4] Checking frontend build...
if not exist "frontend\dist\index.html" (
    echo Building frontend static bundle...
    cd frontend
    call npm install --quiet
    call npm run build
    cd ..
) else (
    echo Frontend build found in frontend\dist\
)

echo [4/4] Starting SmartStock AI server at http://localhost:8000 ...
echo Opening browser...
start http://localhost:8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
