# MarketBridge AI — PowerShell Launcher
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "                     MARKETBRIDGE AI LAUNCHER                      " -ForegroundColor Cyan
Write-Host "          Aura Studio Goods - Autonomous E-Commerce & ML Lab       " -ForegroundColor DarkCyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
Set-Location $rootDir

# Step 0: Ensure ports 3000 and 8000 are clear
Write-Host "[*] Checking and clearing ports 3000 and 8000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000,8000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "    - Stopping process on port $($_.LocalPort) (PID: $($_.OwningProcess))" -ForegroundColor Gray
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Step 1: Detect Python
$pythonExec = $null
if (Test-Path "$rootDir\venv\Scripts\python.exe") {
    $pythonExec = "$rootDir\venv\Scripts\python.exe"
    Write-Host "[*] Detected Python virtual environment in .\venv" -ForegroundColor Green
} elseif (Get-Command "python" -ErrorAction SilentlyContinue) {
    $pythonExec = "python"
    Write-Host "[*] Using system Python: python" -ForegroundColor Green
} elseif (Get-Command "py" -ErrorAction SilentlyContinue) {
    $pythonExec = "py -3"
    Write-Host "[*] Using Python Launcher (py -3)" -ForegroundColor Green
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe") {
    $pythonExec = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
    Write-Host "[*] Detected Python 3.12 in AppData" -ForegroundColor Green
} else {
    Write-Host "[!] Python 3.10+ not found in PATH or standard locations." -ForegroundColor Red
    Write-Host "[!] Please install Python from https://www.python.org/downloads/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Check Node.js and dependencies
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Node.js / npm not found in PATH." -ForegroundColor Red
    Write-Host "[!] Please install Node.js (v20+) from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "$rootDir\node_modules")) {
    Write-Host "[*] Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

# Step 3: Launch Python ML Microservice
Write-Host "`n[1/3] Starting Python ML Microservice on port 8000..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "$pythonExec -m uvicorn services.ml.app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory $rootDir

# Step 4: Launch Web Server
Write-Host "[2/3] Starting Node.js Express server on port 3000..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "npm run dev" -WorkingDirectory $rootDir

# Step 5: Wait and open browser
Write-Host "[3/3] Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`nOpening MarketBridge AI in your default browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n===================================================================" -ForegroundColor Green
Write-Host "  MarketBridge AI is now running successfully!" -ForegroundColor Green
Write-Host "    - Web Application:       http://localhost:3000" -ForegroundColor White
Write-Host "    - Python ML Swagger API: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  To stop all services at any time, run stop.bat or .\stop.ps1" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Green
