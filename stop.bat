@echo off
title MarketBridge AI Stopper
cls

echo ===================================================================
echo                     MARKETBRIDGE AI STOPPER
echo ===================================================================
echo.
echo Stopping services on Port 3000 and Port 8000...
echo.

:: 1. Terminate using PowerShell (primary method)
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,8000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: 2. Fallback check with netstat and taskkill
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ===================================================================
echo  All MarketBridge AI services have been stopped.
echo ===================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit
