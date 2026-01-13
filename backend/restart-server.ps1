# PowerShell script to restart the backend server
Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if node process is running
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️  Found running Node.js processes:" -ForegroundColor Yellow
    $nodeProcesses | Format-Table Id, ProcessName, StartTime -AutoSize
    Write-Host "Please stop the backend server manually (Ctrl+C) or kill the process:" -ForegroundColor Yellow
    Write-Host "Stop-Process -Id <ProcessId> -Force" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✅ No Node.js processes found running" -ForegroundColor Green
}

Write-Host "📋 To start the server:" -ForegroundColor Cyan
Write-Host "   1. Navigate to backend folder: cd backend" -ForegroundColor White
Write-Host "   2. Start server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "✅ After restart, you should see:" -ForegroundColor Green
Write-Host "   ✅ Routes registered:" -ForegroundColor Green
Write-Host "      - /api/auth (authentication)" -ForegroundColor Gray
Write-Host "      - /api/products (products with Open Food Facts)" -ForegroundColor Gray
Write-Host "      - /api/cart (shopping cart)" -ForegroundColor Gray
Write-Host "      - /api/orders (order management)" -ForegroundColor Gray
Write-Host ""



