@echo off

cd /d "%~dp0backend"

where node >nul 2>nul

if errorlevel 1 (
    echo Node.js nao encontrado.
    echo Instale Node.js 20 ou superior.
    pause
    exit /b 1
)

if not exist .env (
    copy .env.example .env >nul
    echo Arquivo backend\.env criado em modo DEMO.
)

echo Iniciando backend da Elora...

node server.mjs

pause