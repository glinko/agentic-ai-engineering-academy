@echo off
setlocal
cd /d "%~dp0"
if not exist "runtime\python.exe" (
  echo Missing bundled Python. Extract the entire Windows ZIP before starting.
  pause
  exit /b 1
)
"%~dp0runtime\python.exe" -I "%~dp0server.py" --open %*
if errorlevel 1 pause
