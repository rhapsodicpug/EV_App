# EV App Backend Starter Script for PowerShell
# This script properly activates the virtual environment and starts the FastAPI server

Write-Host "Starting EV App Backend..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Change to project directory
Set-Location "C:\Users\Siddharth\Downloads\EV_App"

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check if activation was successful
if ($env:VIRTUAL_ENV) {
    Write-Host "Virtual environment activated: $env:VIRTUAL_ENV" -ForegroundColor Green
} else {
    Write-Host "Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Change to app directory
Set-Location "app"

# Start the FastAPI server
Write-Host "Starting FastAPI server..." -ForegroundColor Yellow
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "  - http://localhost:8000" -ForegroundColor White
Write-Host "  - http://0.0.0.0:8000" -ForegroundColor White
Write-Host "  - API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

try {
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Write-Host "Make sure all dependencies are installed with: pip install -r requirements.txt" -ForegroundColor Yellow
}
