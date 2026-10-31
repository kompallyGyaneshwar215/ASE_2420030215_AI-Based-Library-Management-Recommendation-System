@echo off
title Spring Boot Backend (Port 8080)
cd /d "%~dp0backend"
echo ===================================================
echo Starting Spring Boot Backend (Port 8080)
echo ===================================================
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "PATH=C:\Program Files\Java\jdk-21\bin;%PATH%"
mvn spring-boot:run
pause
