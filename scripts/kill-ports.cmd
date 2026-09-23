@echo off
setlocal enabledelayedexpansion
echo Killing all listening ports on 3000, 5000, 4000, 3001, 8080, plus every 127.0.0.1 listener...
for %%P in (3000 5000 4000 3001 8080) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r "LISTENING" ^| findstr ":%%~P "') do (
    taskkill /F /PID %%a >nul 2>&1 && echo killed %%a on port %%~P
  )
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r "LISTENING" ^| findstr "127.0.0.1"') do (
  taskkill /F /PID %%a >nul 2>&1 && echo killed %%a (localhost)
)
echo done