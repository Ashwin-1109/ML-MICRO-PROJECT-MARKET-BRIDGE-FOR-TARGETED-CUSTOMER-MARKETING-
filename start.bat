@echo off
setlocal enabledelayedexpansion
title MarketBridge AI Launcher
cls

echo ===================================================================
echo                     MARKETBRIDGE AI LAUNCHER
echo          Aura Studio Goods - Autonomous E-Commerce ^& ML Lab
echo ===================================================================
echo.

:: Ensure working directory is the script's root directory without trailing slash
set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
cd /d "%ROOT_DIR%"

:: Step 0: Clear any existing stale listeners on ports 3000 and 8000
echo [*] Ensuring ports 3000 and 8000 are available...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,8000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: Step 1: Detect Python executable
set "PYTHON_CMD="

:: Check 1: Virtual environment in .\venv
if exist "%ROOT_DIR%\venv\Scripts\python.exe" (
    set PYTHON_CMD="%ROOT_DIR%\venv\Scripts\python.exe"
    echo [*] Detected Python virtual environment in .\venv
)

:: Check 2: System python in PATH
if not defined PYTHON_CMD (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=python"
        echo [*] Using system Python: python
    )
)

:: Check 3: Python Launcher (py -3)
if not defined PYTHON_CMD (
    where py >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=py -3"
        echo [*] Using Python Launcher: py -3
    )
)

:: Check 4: Detected Python in standard Local AppData
if not defined PYTHON_CMD (
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
        echo [*] Detected Python 3.12 in AppData
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
        set PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
        echo [*] Detected Python 3.11 in AppData
    )
)

if not defined PYTHON_CMD (
    echo [!] Python 3.10+ was not found in PATH or standard locations.
    echo [!] Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Step 2: Check Node.js and dependencies
where npm >nul 2>&1
if errorlevel 1 (
    echo [!] Node.js / npm not found in PATH.
    echo [!] Please install Node.js v20+ from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\node_modules" (
    echo [*] Installing Node.js dependencies...
    call npm install
)

:: Step 3: Launch Python ML Microservice on port 8000
echo.
echo [1/3] Starting Python ML Microservice on port 8000...
start "MarketBridge ML Microservice (Port 8000)" cmd /k %PYTHON_CMD% -m uvicorn services.ml.app.main:app --host 127.0.0.1 --port 8000

:: Step 4: Launch Node.js Web Server on port 3000
echo [2/3] Starting Node.js Express server on port 3000...
start "MarketBridge Web Server (Port 3000)" cmd /k npm run dev

:: Step 5: Wait and open browser
echo [3/3] Waiting for services to initialize...
ping 127.0.0.1 -n 5 >nul

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
ping 127.0.0.1 -n 4 >nul
exit
