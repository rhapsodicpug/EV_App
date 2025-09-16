@echo off
echo Starting EV App on Web...
echo =========================

cd /d "%~dp0"

echo Starting Backend Server...
start "EV App Backend" cmd /k "python run_backend.py"

timeout /t 3 /nobreak > nul

echo Starting Web Frontend...
cd frontend
start "EV App Web" cmd /k "npx expo start --web"

echo.
echo ========================================
echo EV App is starting on web...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:19006
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
pause
