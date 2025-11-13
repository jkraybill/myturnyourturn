#!/bin/bash
# Install Gordo Framework Safety Hooks
# Copies pre-commit hook to .git/hooks/

echo ""
echo "🚂 Installing Gordo Framework Safety Hooks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "❌ Error: .git directory not found"
  echo "   Run this script from the repository root"
  echo "   Or initialize git first: git init"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source pre-commit hook
SOURCE_HOOK="$SCRIPT_DIR/pre-commit"

# Destination
DEST_HOOK=".git/hooks/pre-commit"

# Check if source exists
if [ ! -f "$SOURCE_HOOK" ]; then
  echo "❌ Error: pre-commit hook not found at $SOURCE_HOOK"
  exit 1
fi

# Backup existing pre-commit hook if it exists
if [ -f "$DEST_HOOK" ]; then
  echo "📦 Backing up existing pre-commit hook..."
  cp "$DEST_HOOK" "$DEST_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
  echo "   Backup saved as: $DEST_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy hook
echo "📝 Installing pre-commit hook..."
cp "$SOURCE_HOOK" "$DEST_HOOK"

# Make executable
chmod +x "$DEST_HOOK"
chmod +x "$SCRIPT_DIR"/*.sh

echo "✅ Hooks installed successfully!"
echo ""
echo "Installed hooks:"
echo "  1. check-secrets.sh (MANDATORY - scans for secrets)"
echo "  2. verify-tests.sh (MANDATORY - runs test suite)"
echo "  3. auto-format.sh (OPTIONAL - auto-formats code)"
echo ""
echo "These hooks will run automatically before every commit."
echo ""
echo "To bypass (Trust Level 2+ only, emergencies):"
echo "  git commit --no-verify"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
