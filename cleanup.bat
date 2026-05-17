@echo off
REM Cleanup: Remove verbose documentation files
REM Run this to keep directory clean

echo Cleaning up documentation files...

REM Remove verbose docs (keeping only README.md)
del /Q DOCUMENTATION_INDEX.md 2>nul
del /Q ENHANCEMENTS.md 2>nul
del /Q FIXES_APPLIED.md 2>nul
del /Q IMPLEMENTATION_COMPLETE.md 2>nul
del /Q QUICK_REFERENCE.md 2>nul
del /Q STATUS_SUMMARY.txt 2>nul

echo.
echo Cleanup complete!
echo Directory organized!
pause
