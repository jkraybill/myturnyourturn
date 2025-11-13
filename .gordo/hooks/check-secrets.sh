#!/bin/bash
# check-secrets hook
# Scans staged files for accidentally committed secrets
# Trust Level: 0-3 (MANDATORY - never bypassed)

echo "🔒 Checking for secrets..."

# Patterns to detect (looking for actual secret values, not just keywords)
# These patterns look for KEY=value, not just the word "key"
PATTERNS=(
  "api[_-]?key\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "api[_-]?secret\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "access[_-]?token\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "auth[_-]?token\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "secret[_-]?key\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "password\s*[=:]\s*['\"]?[a-zA-Z0-9]{8,}"
  "client[_-]?secret\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "aws[_-]?access\s*[=:]\s*['\"]?[a-zA-Z0-9]{20,}"
  "bearer\s+[a-zA-Z0-9]{20,}"
  "-----BEGIN.*PRIVATE KEY-----"
)

# Get staged files (excluding documentation and examples)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -v -E "\.md$|\.example$|^docs/|^\.gordo/hooks/")

if [ -z "$STAGED_FILES" ]; then
  echo "✓ No files to check"
  exit 0
fi

FOUND_SECRETS=false

for pattern in "${PATTERNS[@]}"; do
  # Search staged files for pattern
  MATCHES=$(echo "$STAGED_FILES" | xargs grep -niE "$pattern" 2>/dev/null || true)

  if [ ! -z "$MATCHES" ]; then
    echo "❌ Potential secret found matching pattern: $pattern"
    echo "$MATCHES"
    FOUND_SECRETS=true
  fi
done

# Check for actual .env files (should NEVER be committed)
ENV_FILES=$(echo "$STAGED_FILES" | grep -E "^\.env$|^\.env\.local$" || true)
if [ ! -z "$ENV_FILES" ]; then
  echo "❌ .env file staged for commit:"
  echo "$ENV_FILES"
  echo ""
  echo "NEVER commit .env files! Use .env.example for examples."
  FOUND_SECRETS=true
fi

if [ "$FOUND_SECRETS" = true ]; then
  echo ""
  echo "🚨 COMMIT BLOCKED: Potential secrets detected"
  echo ""
  echo "If these are false positives (example code, documentation):"
  echo "1. Review the matches above carefully"
  echo "2. If truly safe, add to .gitignore or use placeholder values"
  echo "3. NEVER bypass this check with --no-verify"
  echo ""
  exit 1
fi

echo "✓ No secrets detected"
exit 0
