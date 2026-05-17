#!/bin/bash
# Cleanup: Remove verbose documentation files
# Run this to keep directory clean

cd "$(dirname "$0")"

echo "🧹 Cleaning up documentation files..."

# Remove verbose docs (keeping only README.md)
rm -f DOCUMENTATION_INDEX.md
rm -f ENHANCEMENTS.md
rm -f FIXES_APPLIED.md
rm -f IMPLEMENTATION_COMPLETE.md
rm -f QUICK_REFERENCE.md
rm -f STATUS_SUMMARY.txt

echo "✅ Cleanup complete"
echo "📁 Directory organized!"
