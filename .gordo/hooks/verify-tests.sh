#!/bin/bash
# verify-tests hook
# Ensures all tests pass before commit
# Trust Level: 1+ (MANDATORY after demonstrated understanding)

echo "🧪 Running test suite..."

# Check if package.json exists (project initialized)
if [ ! -f "package.json" ]; then
  echo "⚠️  No package.json found - skipping tests (project not initialized)"
  exit 0
fi

# Check if test script exists
if ! grep -q '"test"' package.json; then
  echo "⚠️  No test script defined - skipping (add 'test' script to package.json)"
  exit 0
fi

# Run tests
npm test

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo ""
  echo "🚨 COMMIT BLOCKED: Tests failed"
  echo ""
  echo "CONSTITUTION.md requirement: All tests must be green before commit."
  echo ""
  echo "Fix the failing tests, then commit again."
  echo ""
  echo "Trust Level 2+ can bypass with --no-verify for emergencies"
  echo "(but must document reason in journal and fix ASAP)"
  echo ""
  exit 1
fi

echo "✓ All tests passed"
exit 0
