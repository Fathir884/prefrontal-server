@echo off
title Productivity App Launcher
echo ===========================================
echo       Starting Productivity Super App
echo ===========================================

cd client
if %errorlevel% neq 0 (
    echo Error: Could not find 'client' directory.
    echo Please make sure you are running this from the project root.
    pause
    exit /b
)

REM Check if dependencies are installed
if not exist node_modules (
    echo First run detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing dependencies.
        pause
        exit /b
    )
)

echo.
echo Starting Development Server...
echo The app will open in your default browser shortly.
echo.

REM Open browser after a slight delay to allow Vite to start
timeout /t 3 >nul
start http://localhost:5175

REM Run the dev server
npm run dev

pause
