@echo off
title MarketBridge AI Stopper
cls

echo ===================================================================
echo                     MARKETBRIDGE AI STOPPER
echo ===================================================================
echo.
echo Stopping services on Port 3000 and Port 8000...
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping Node.js server (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping Python ML service (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ===================================================================
echo  All MarketBridge AI services have been stopped.
echo ===================================================================
echo.
timeout /t 3 >nul
exit
