#!/bin/bash
# auto-format hook
# Automatically formats code before commit
# Trust Level: 2+ (OPTIONAL - never blocks, just helps)

echo "💅 Auto-formatting code..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "⚠️  No package.json found - skipping format"
  exit 0
fi

# Detect and run available formatters

FORMATTED=false

# Prettier (JavaScript/TypeScript)
if grep -q '"prettier"' package.json 2>/dev/null || [ -f ".prettierrc" ]; then
  if command -v npx &> /dev/null; then
    echo "  Running Prettier..."
    npx prettier --write $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|json|css|md)$') 2>/dev/null || true
    FORMATTED=true
  fi
fi

# ESLint with --fix (if configured)
if grep -q '"eslint"' package.json 2>/dev/null; then
  if command -v npx &> /dev/null; then
    echo "  Running ESLint --fix..."
    npx eslint --fix $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$') 2>/dev/null || true
    FORMATTED=true
  fi
fi

# Re-add formatted files to staging
if [ "$FORMATTED" = true ]; then
  git add -u
  echo "✓ Code formatted and re-staged"
else
  echo "ℹ️  No formatters configured yet (install prettier/eslint later)"
fi

# Never block commit (this is optional automation)
exit 0
