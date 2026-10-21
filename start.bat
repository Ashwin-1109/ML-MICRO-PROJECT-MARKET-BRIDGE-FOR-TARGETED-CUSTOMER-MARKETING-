@echo off
setlocal enabledelayedexpansion
title MarketBridge AI Launcher
cls

echo ===================================================================
echo                     MARKETBRIDGE AI LAUNCHER
echo          Aura Studio Goods - Autonomous E-Commerce & ML Lab
echo ===================================================================
echo.

cd /d "%~dp0"

:: Check for Python in venv or system PATH
if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_EXEC=%~dp0venv\Scripts\python.exe"
    echo [*] Detected Python virtual environment in .\venv
) else (
    set "PYTHON_EXEC=python"
    echo [*] Using system Python
)

echo.
echo [1/3] Starting Python ML Microservice on port 8000...
start "MarketBridge ML Microservice (Port 8000)" cmd /k "%PYTHON_EXEC% -m uvicorn services.ml.app.main:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Node.js Express server on port 3000...
start "MarketBridge Web Server (Port 3000)" cmd /k "npm run dev"

echo [3/3] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Opening MarketBridge AI in your default browser...
start "" "http://localhost:3000"

echo.
echo ===================================================================
echo  MarketBridge AI is now running successfully!
echo    - Web Application:       http://localhost:3000
echo    - Python ML Swagger API: http://127.0.0.1:8000/docs
echo.
echo  To stop all services at any time, run stop.bat or close the windows.
echo ===================================================================
echo.
timeout /t 4 >nul
exit
