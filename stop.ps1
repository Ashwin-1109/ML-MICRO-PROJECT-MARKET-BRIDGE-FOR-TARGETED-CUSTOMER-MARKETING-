# MarketBridge AI — PowerShell Stopper
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "                     MARKETBRIDGE AI STOPPER                       " -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Stopping services on Port 3000 and Port 8000..." -ForegroundColor Yellow

$stopped = 0
Get-NetTCPConnection -LocalPort 3000,8000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping process on port $($_.LocalPort) (PID: $($_.OwningProcess))..." -ForegroundColor Gray
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    $stopped++
}

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  All MarketBridge AI services have been stopped." -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
