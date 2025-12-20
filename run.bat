@echo off
echo ========================================
echo    Meme Generator - Starting Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking for node_modules...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting development server...
echo.
echo App will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
