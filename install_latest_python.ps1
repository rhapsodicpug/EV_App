# Python 3.13.1 Installation Script
# This script downloads and installs the latest Python version

Write-Host "🐍 Python 3.13.1 Installation Script" -ForegroundColor Green
Write-Host "=" * 50

# Check if running as administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Note: Running without administrator privileges" -ForegroundColor Yellow
    Write-Host "   Some features may require admin rights" -ForegroundColor Yellow
}

# Download URL for Python 3.13.1
$pythonUrl = "https://www.python.org/ftp/python/3.13.1/python-3.13.1-amd64.exe"
$installerPath = "$env:TEMP\python-3.13.1-amd64.exe"

Write-Host "`n📥 Downloading Python 3.13.1..." -ForegroundColor Cyan

try {
    # Download Python installer
    Invoke-WebRequest -Uri $pythonUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Downloaded successfully" -ForegroundColor Green
    
    Write-Host "`n🚀 Starting Python installation..." -ForegroundColor Cyan
    Write-Host "   Please choose these options in the installer:" -ForegroundColor Yellow
    Write-Host "   ✅ Add Python to PATH" -ForegroundColor Yellow
    Write-Host "   ✅ Install pip" -ForegroundColor Yellow
    Write-Host "   ✅ Install for all users (if admin)" -ForegroundColor Yellow
    Write-Host "   ✅ Add Python to environment variables" -ForegroundColor Yellow
    
    # Launch installer
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host "`n🧹 Cleaning up installer..." -ForegroundColor Cyan
    Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue
    
    Write-Host "`n🧪 Testing new Python installation..." -ForegroundColor Cyan
    
    # Test Python installation
    $pythonTest = python --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python installed successfully: $pythonTest" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Python command not found. You may need to restart your terminal." -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Installation complete!" -ForegroundColor Green
    Write-Host "💡 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart your terminal/PowerShell" -ForegroundColor White
    Write-Host "   2. Run: python --version" -ForegroundColor White
    Write-Host "   3. Test your backend: python run_backend.py" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during installation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Manual installation:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://python.org/downloads" -ForegroundColor White
    Write-Host "   2. Download Python 3.13.1 for Windows" -ForegroundColor White
    Write-Host "   3. Run installer with 'Add to PATH' option" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
