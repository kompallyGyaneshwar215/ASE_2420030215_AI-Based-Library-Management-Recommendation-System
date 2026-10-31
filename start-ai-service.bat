@echo off
title AI Recommendation Service (Port 8000)
cd /d "%~dp0ai-recommendation-service"
echo ===================================================
echo Starting AI Recommendation Engine (FastAPI / Port 8000)
echo ===================================================
python main.py
pause
