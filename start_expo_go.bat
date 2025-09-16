@echo off
echo Starting EV App Frontend with Expo Go...
echo =========================================

cd /d "%~dp0\frontend"

echo Checking for node_modules...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Starting Expo development server in Expo Go mode...
echo.
echo Instructions:
echo 1. Wait for QR code to appear
echo 2. Open Expo Go app on your phone
echo 3. Scan the QR code
echo.
npx expo start --go

pause
