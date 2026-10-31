@echo off
title AI Library Management System Launcher
echo ==============================================================
echo   AI-Based Library Management & Recommendation System
echo ==============================================================
echo Launching all 3 microservices in dedicated terminal windows:
echo 1. AI Recommendation Engine  : http://localhost:8000
echo 2. Spring Boot REST API      : http://localhost:8080
echo 3. React Frontend Web Portal : http://localhost:5173
echo ==============================================================

start "1. AI Recommendation Engine" cmd /k "call "%~dp0start-ai-service.bat""
timeout /t 3 /nobreak >nul

start "2. Spring Boot Backend" cmd /k "call "%~dp0start-backend.bat""
timeout /t 5 /nobreak >nul

start "3. React Frontend Portal" cmd /k "call "%~dp0start-frontend.bat""

echo.
echo All services launched!
echo Access the web application at: http://localhost:5173
echo.
pause
