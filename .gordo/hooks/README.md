# Safety Hooks: MyTurnYourTurn

## Purpose

These hooks automatically run before every git commit to enforce quality standards from CONSTITUTION.md.

## Installed Hooks

### 1. check-secrets.sh
- **What:** Scans for accidentally committed secrets (API keys, passwords, tokens)
- **When:** Every commit (Trust Level 0-3)
- **Blocks:** YES (cannot bypass)
- **Why:** Prevents catastrophic security exposure

### 2. verify-tests.sh
- **What:** Runs test suite and ensures all tests pass
- **When:** Every commit (Trust Level 1+)
- **Blocks:** YES (but can bypass at Trust Level 2+ with --no-verify for emergencies)
- **Why:** Enforces "all tests green before commit" from CONSTITUTION.md

### 3. auto-format.sh
- **What:** Automatically formats code with Prettier/ESLint
- **When:** Every commit (Trust Level 2+)
- **Blocks:** NO (never blocks, optional automation)
- **Why:** Keeps code clean and consistent

## Installation

**Automated (recommended):**
```bash
./.gordo/hooks/install-hooks.sh
```

**Manual:**
```bash
# Copy pre-commit hook to .git/hooks
cp .gordo/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Bypassing Hooks

**Generally forbidden**, but:
- Trust Level 2+ can use `git commit --no-verify` for emergencies
- Must document reason in GORDO_JOURNAL.md
- Must fix issue ASAP in next commit

**Never bypass check-secrets** - too risky.

## How Hooks Work

When you run `git commit`:
1. Git calls `.git/hooks/pre-commit`
2. Pre-commit runner calls each hook in order
3. If any hook exits with code 1, commit is blocked
4. Fix issues, then commit again

## Updating Hooks

Hooks are stored in `.gordo/hooks/` (tracked in git).
If hooks are updated, re-run installation:
```bash
./.gordo/hooks/install-hooks.sh
```

## Troubleshooting

**Hooks not running?**
- Check `.git/hooks/pre-commit` exists and is executable
- Run `ls -la .git/hooks/pre-commit`
- Re-run `.gordo/hooks/install-hooks.sh`

**False positive on secrets check?**
- Review the detected pattern
- Use placeholder values in examples
- Add file to .gitignore if appropriate
- Never commit actual secrets

**Tests failing?**
- Fix the tests (don't bypass!)
- Run `npm test` to verify locally
- All tests must be green before commit

## Philosophy

**Hooks assist DHH's success, they don't control DHH.**

These automated checks catch mistakes early (2 minutes) instead of late (30+ minutes after Andrew reviews). Trust-aware enforcement balances safety with autonomy.

**When you're here, you're family—and family doesn't ship broken code.**
