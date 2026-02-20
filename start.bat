@echo off
echo Iniciando aplicação Node.js...
npm start
if errorlevel 1 (
    echo Erro ao iniciar a aplicação!
    pause
)