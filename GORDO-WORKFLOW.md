# Workflow: MyTurnYourTurn
## How We Build, Test, and Ship

---

## Overview

This document defines **how we work** on MyTurnYourTurn. It complements CONSTITUTION.md (what we must do) with practical workflow guidance (how we do it).

**Philosophy:** Plan carefully, then go fast. Issue-driven, TDD-enforced, ship with confidence.

---

## I. Issue-Driven Development

### A. Every Feature Starts With An Issue

**Process:**
1. **Create GitHub issue** describing the feature/bug
2. **Define acceptance criteria** (how do we know it's done?)
3. **Assign priority label** (p0-now, p1-soon, p2-later)
4. **DHH proposes approach** (with trade-offs if complex)
5. **Andrew approves** (or requests changes)
6. **DHH implements** (using TDD)
7. **Close issue** when complete

**Issue Template:**
```markdown
## Description
[What needs to be built or fixed]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All tests pass

## Technical Notes
[Any technical considerations, trade-offs, or constraints]

## Priority
[p0-now / p1-soon / p2-later]
```

### B. Priority Labels

**p0-now** - Critical, do immediately
- Data integrity bugs
- Security vulnerabilities
- User-blocking issues
- OAuth failures

**p1-soon** - Important, schedule next
- New features for launch
- Performance improvements
- UX enhancements

**p2-later** - Nice to have, backlog
- Future enhancements
- Optimization opportunities
- Refactoring tasks

### C. No Code Without Issues

**Forbidden:**
- ❌ Implementing features without documented requirements
- ❌ "Quick fixes" that bypass issue creation
- ❌ Orphan commits with no issue reference

**Exception:** Framework docs updates (CONSTITUTION, WORKFLOW, etc.) don't need issues.

---

## II. Test-Driven Development Workflow

### A. The Red-Green-Refactor Cycle

**Step 1: RED (Write Failing Test)**
```typescript
// Test what should happen
test('toggle switches turn from Alice to Bob', () => {
  const result = toggleTurn(relationship, 'Alice');
  expect(result.currentTurn).toBe('Bob');
  expect(result.history).toHaveLength(1);
});
```
- Run test → It fails (red)
- This proves the test actually tests something

**Step 2: GREEN (Make Test Pass)**
```typescript
// Implement minimal code to pass test
function toggleTurn(relationship, currentUser) {
  const nextUser = relationship.users.find(u => u !== currentUser);
  const history = [...relationship.history, {
    from: currentUser,
    to: nextUser,
    timestamp: new Date()
  }];
  return { currentTurn: nextUser, history };
}
```
- Run test → It passes (green)
- Don't write more code than needed

**Step 3: REFACTOR (Improve Code)**
```typescript
// Clean up, optimize, add types
function toggleTurn(
  relationship: Relationship,
  currentUser: string
): ToggleResult {
  // Now we can refactor with confidence
  // Tests protect against breaking changes
}
```
- Run tests → Still passing
- Code is clean and maintainable

### B. Test Organization

**Directory Structure:**
```
src/
  features/
    toggle/
      toggle.ts
      toggle.test.ts
    history/
      history.ts
      history.test.ts
    relationships/
      relationships.ts
      relationships.test.ts
```

**Test Types:**
- **Unit tests** - Individual functions (toggle logic, validation)
- **Integration tests** - Multiple components (OAuth + database)
- **E2E tests** - Full user flows (signup → create relationship → toggle)

### C. Running Tests

**During Development:**
```bash
npm test -- --watch
```
- Tests run automatically on file changes
- Instant feedback loop

**Before Commit:**
```bash
npm test
```
- All tests must pass (enforced by hooks)
- No skipped tests

**CI/CD:**
- Tests run on every push to GitHub
- PRs cannot merge if tests fail

---

## III. Git Hygiene

### A. Branch Strategy

**Main Branch:**
- Production-ready code only
- All tests always green
- Never force push

**Feature Branches (optional for rapid iteration):**
- For complex features that need multiple commits
- Merge to main when complete
- Delete after merge

**For This Project:**
- Given urgency and solo development, we can commit directly to main
- BUT: All quality gates must pass (tests, hooks)

### B. Commit Messages

**Format:**
```
<type>(#issue): <description>

Fix #15: Add validation to prevent concurrent toggle race condition

- Added database transaction wrapping
- Tests for simultaneous toggle attempts
- Graceful error handling with retry
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `test` - Adding tests
- `refactor` - Code improvements without behavior change
- `docs` - Documentation updates
- `chore` - Dependency updates, config changes

**Requirements:**
- ✅ Reference issue number: `Fix #15` or `Closes #23`
- ✅ Clear description of what changed
- ✅ Body explains why (if not obvious)

### C. Commit Frequency

**Good:**
- ✅ Commit logical units of work
- ✅ Each commit has passing tests
- ✅ Commit messages tell a story

**Bad:**
- ❌ Giant commits doing 10 things
- ❌ Work-in-progress commits (use local branches if needed)
- ❌ Commits with broken tests

### D. Push Immediately

**After Each Feature:**
```bash
git add .
git commit -m "feat(#15): Add toggle validation"
npm test  # Hooks run automatically
git push
```

**Why:**
- Backup in case of local machine failure
- GitHub issues link to commits
- CI/CD runs tests
- Andrew can see progress

---

## IV. OAuth Integration Workflow

### A. Provider Setup (One-Time)

**For Each Provider (Google, Meta, Apple):**

1. **Register OAuth Application**
   - Google: Google Cloud Console
   - Meta: Meta for Developers
   - Apple: Apple Developer Portal

2. **Configure Redirect URIs**
   - Development: `http://localhost:3000/api/auth/callback`
   - Production: `https://myturnyourturn.com/api/auth/callback`

3. **Store Credentials Securely**
   ```bash
   # .env (never committed)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_secret
   META_CLIENT_ID=...
   META_CLIENT_SECRET=...
   APPLE_CLIENT_ID=...
   APPLE_CLIENT_SECRET=...
   ```

4. **Document in .env.example**
   ```bash
   # .env.example (committed for reference)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_secret_here
   ```

### B. OAuth Implementation

**Use NextAuth.js (Recommended):**
- Handles all OAuth providers
- Secure by default
- Well-tested library

**Don't:**
- ❌ Roll your own OAuth implementation
- ❌ Store tokens in localStorage
- ❌ Trust client-side validation

### C. Testing OAuth

**Integration Tests:**
```typescript
test('Google OAuth flow completes successfully', async () => {
  // Mock OAuth provider response
  // Verify token stored securely
  // Verify user created in database
});
```

**Manual Testing:**
- Test all three providers (Google, Meta, Apple)
- Verify redirect flow works
- Confirm tokens stored securely
- Check token refresh works

---

## V. Database Workflow

### A. Schema Changes

**Process:**
1. **Create migration** (describes schema change)
2. **Write tests** that require new schema
3. **Run migration** locally
4. **Verify tests pass** with new schema
5. **Commit migration + code + tests** together
6. **Document rollback** procedure

**Example Migration:**
```sql
-- migrations/001_create_relationships.sql
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id),
  user2_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_relationship UNIQUE(user1_id, user2_id)
);
```

### B. Migration Testing

**Required Tests:**
- ✅ Migration runs successfully
- ✅ Rollback works correctly
- ✅ Data integrity maintained during migration
- ✅ Indexes created properly
- ✅ Constraints enforced

### C. Database Connection

**Connection Pooling:**
- Use connection pool (pg-pool or Prisma)
- Limit connections (max 10 for dev, scale for prod)
- Handle connection errors gracefully

**Environment Variables:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/myturnyourturn
```

---

## VI. Deployment Workflow

### A. Pre-Deployment Checklist

**Before Every Deploy:**
- [ ] All tests green locally
- [ ] CI/CD tests passing on GitHub
- [ ] Database migrations tested
- [ ] Environment variables configured in production
- [ ] OAuth providers configured for production URLs
- [ ] Rollback plan documented
- [ ] Andrew approves deployment

### B. Deployment Platforms (Options)

**Vercel (Recommended for Next.js):**
- **Pros:** Zero-config Next.js deployment, automatic HTTPS, CDN
- **Cons:** Limited database options (need external PostgreSQL)
- **Best for:** Fast launch, minimal ops overhead

**Railway:**
- **Pros:** Built-in PostgreSQL, simple deployment, good for monoliths
- **Cons:** Slightly more expensive than Vercel
- **Best for:** All-in-one solution (app + database)

**Render:**
- **Pros:** Free tier, PostgreSQL included, straightforward
- **Cons:** Slower cold starts, less polish than Vercel
- **Best for:** Budget-conscious launch

**Decision:** DHH will propose platform with trade-offs, Andrew approves.

### C. Deployment Process

**First Deployment:**
1. Choose platform (Andrew approves)
2. Connect GitHub repo
3. Configure environment variables
4. Run database migrations
5. Test OAuth flows in production
6. Verify all features work
7. Monitor for errors

**Subsequent Deployments:**
1. Push to main branch (all tests green)
2. Platform auto-deploys
3. Verify deployment succeeded
4. Check error tracking (Sentry)
5. Monitor performance

### D. Rollback Procedure

**If Deployment Fails:**
1. Identify issue (logs, error tracking)
2. Revert to previous commit if critical
3. Platform auto-deploys previous version
4. Fix issue locally with tests
5. Re-deploy when fixed

**Database Rollback:**
- Keep migration rollback scripts
- Test rollback in staging first
- Document data loss implications

---

## VII. Monitoring and Debugging

### A. Error Tracking

**Setup Sentry (or equivalent):**
```typescript
// Capture all unhandled errors
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

**Monitor:**
- Unhandled exceptions
- OAuth failures
- Database errors
- Performance issues

### B. Logging

**Log Levels:**
- **ERROR** - Critical failures (alert immediately)
- **WARN** - Potential issues (review regularly)
- **INFO** - Normal operations (toggle events, user signups)
- **DEBUG** - Detailed info (dev only)

**Don't Log:**
- ❌ User passwords or tokens
- ❌ Sensitive personal data
- ❌ OAuth secrets

### C. Performance Monitoring

**Track:**
- API response times (<500ms required)
- Database query times
- Page load times (<2s on 3G)
- Toggle operation latency (<200ms perceived)

---

## VIII. Communication Workflow

### A. Session Start

**DHH reads:**
1. TRUST_PROTOCOL.md (current trust level)
2. GORDO_JOURNAL.md (last 10 entries)
3. CONSTITUTION.md (non-negotiables)
4. Open GitHub issues (p0-now priorities)

**DHH provides:**
- Current status summary
- Ready to proceed or blocked

### B. During Work

**DHH explains in plain English:**
- What is being built
- Why this approach was chosen
- Trade-offs for key decisions
- Progress updates

**Andrew provides:**
- Feedback on approach
- Approval to proceed
- "railtorail" for full autonomy
- "go back one step" if change needed

### C. Session End

**DHH documents:**
- Work completed (issue numbers)
- Tests status (all green)
- Journal entry (patterns learned)
- Framework improvements (if any)
- Next session priorities

---

## IX. Framework Self-Improvement

### A. When Patterns Emerge

**If DHH notices:**
- Communication that worked/didn't work
- Workflow that was efficient/inefficient
- Standards that need clarification
- Tools that would help

**Then DHH:**
- Documents in journal
- Proposes update to framework docs
- Andrew reviews and approves

**Trust Level Requirements:**
- Level 0-1: Propose only, Andrew decides
- Level 2: Update WORKFLOW/COLLABORATION autonomously
- Level 3: Update CONSTITUTION with justification

### B. Continuous Improvement

**Every Session:**
- What worked well?
- What should change?
- What should future DHH know?

**Document in journal for compounding improvements.**

---

## X. Quick Reference

**Starting Work:**
```bash
# Pull latest
git pull

# Check status
npm test

# Create issue on GitHub
# Start coding with TDD
```

**During Work:**
```bash
# Run tests continuously
npm test -- --watch

# Commit frequently
git add .
git commit -m "feat(#15): Description"
git push
```

**Ending Work:**
```bash
# Ensure all tests pass
npm test

# Push to GitHub
git push

# Update GORDO_JOURNAL.md
# Close GitHub issues if complete
```

---

## Summary

**Issue-driven → TDD → Commit → Push → Document → Improve**

This workflow ensures quality, speed, and continuous improvement.

**When you're here, you're family—and family ships with confidence.**

---

*This workflow evolves as we discover better patterns.*
