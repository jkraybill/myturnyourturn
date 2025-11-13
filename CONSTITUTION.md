# Constitution: MyTurnYourTurn
## Non-Negotiable Development Standards

---

## Purpose

This document defines the **non-negotiable standards** for MyTurnYourTurn development. These are not suggestions—they are requirements that apply to every session, every commit, every line of code.

**Why this matters:** Data integrity is critical. Corrupt data = commercial death. An outage is inconvenient; data loss is catastrophic.

---

## I. Data Integrity (Critical - Zero Tolerance)

### A. All Data Operations Must Be Validated

**Required:**
- ✅ Every toggle operation must have validation tests
- ✅ Every history entry must be verified for completeness
- ✅ Every relationship creation must validate both users exist
- ✅ Every track (coffee, lunch, etc.) must have integrity checks
- ✅ Database transactions for multi-step operations

**Forbidden:**
- ❌ Updating toggle state without history record
- ❌ Deleting tracks without cascade considerations
- ❌ Modifying relationships without both users' data consistency
- ❌ Any operation that could leave orphaned data
- ❌ Silent failures (log and surface all errors)

### B. Data Corruption Prevention

**Required Tests:**
- ✅ Toggle switches correctly (from A→B, B→A, repeat)
- ✅ History accurately reflects all toggle events
- ✅ Deleting a track doesn't corrupt relationship
- ✅ Adding a track doesn't break existing tracks
- ✅ User deletion handles all relationships gracefully
- ✅ Concurrent toggle attempts handled correctly

**Scenarios to Test:**
- Two users toggle at same time (race condition)
- User deletes account mid-toggle
- Network failure during toggle operation
- Database rollback scenarios
- Track deletion with 100+ history entries

### C. Audit Trail

**Required:**
- ✅ Every toggle must record: who toggled, when, which track
- ✅ Every track creation/deletion must be logged
- ✅ Every relationship change must be auditable
- ✅ Timestamps in UTC for all operations
- ✅ History cannot be modified after creation (append-only)

---

## II. Test-Driven Development (Mandatory)

### A. TDD Workflow

**Required Process:**
1. **Write failing test first** (red)
2. **Make test pass** (green)
3. **Refactor** (improve code)
4. **Repeat**

**Forbidden:**
- ❌ Writing code without tests first
- ❌ Writing tests after implementation
- ❌ Committing broken tests
- ❌ Commenting out failing tests
- ❌ Skipping tests for "simple" features

### B. Test Coverage Standards

**Required:**
- ✅ 100% coverage for data operations (toggle, history, tracks)
- ✅ 100% coverage for authentication logic
- ✅ Integration tests for OAuth flows
- ✅ End-to-end tests for critical user paths
- ✅ Edge case tests (empty states, null values, boundaries)

**Minimum Tests Required:**
- Toggle logic (switch between users)
- History recording (accurate timeline)
- Track management (add/delete/list)
- Relationship management (create/delete/privacy)
- User discovery (find by unique identifier)
- OAuth integration (Google/Meta/Apple)

### C. All Tests Must Be Green

**Before Every Commit:**
- ✅ Run full test suite: `npm test`
- ✅ All tests must pass (enforced by hooks)
- ✅ No skipped tests without documented reason
- ✅ No console warnings or errors

**If Tests Fail:**
- ❌ Cannot commit (hooks will block)
- ❌ Cannot push to GitHub
- ❌ Must fix immediately before proceeding

---

## III. Security (Non-Negotiable)

### A. No Secrets in Code

**Required:**
- ✅ All secrets in `.env` file (never committed)
- ✅ `.env.example` provided with placeholder values
- ✅ `.gitignore` blocks `.env` files
- ✅ Hooks scan for accidentally committed secrets

**Forbidden:**
- ❌ API keys hardcoded in source
- ❌ OAuth client secrets in code
- ❌ Database credentials in code
- ❌ Any token/password in committed files

### B. OAuth Security

**Required:**
- ✅ Use official OAuth libraries (Google, Meta, Apple)
- ✅ Validate tokens server-side
- ✅ Secure token storage (httpOnly cookies or secure storage)
- ✅ HTTPS in production (no HTTP)
- ✅ CSRF protection enabled
- ✅ Token expiry and refresh handled correctly

**Forbidden:**
- ❌ Rolling your own OAuth implementation
- ❌ Storing tokens in localStorage (XSS vulnerable)
- ❌ Trusting client-side token validation
- ❌ Exposing OAuth secrets client-side

### C. Privacy

**Required:**
- ✅ Relationships visible only to the two connected users
- ✅ User discovery requires unique identifier (no public browsing)
- ✅ Cannot see other users' relationships
- ✅ Cannot see other users' history
- ✅ Deleting account removes all personal data

**Forbidden:**
- ❌ Public user lists
- ❌ Leaking relationship data via API
- ❌ Exposing user IDs in URLs (use UUIDs)
- ❌ Logging sensitive user data

---

## IV. Communication (Plain English Required)

### A. Explaining Changes to Andrew

**Required:**
- ✅ Explain what you're building in plain language
- ✅ For key decisions, explain pros/cons of options
- ✅ Use analogies when technical concepts are complex
- ✅ Avoid jargon unless defined first
- ✅ Check understanding ("Does this make sense?")

**Examples:**
- ✅ Good: "We're adding a 'coffee tracker' button. When you tap it, it switches whose turn it is and records the time in the history log."
- ❌ Bad: "Implementing setState mutation with useReducer hook for toggle state management with optimistic UI updates."

### B. Commit Messages

**Required:**
- ✅ Reference GitHub issue: `Fix #123: Description`
- ✅ Clear description of what changed
- ✅ Why it changed (if not obvious from issue)

**Examples:**
- ✅ Good: `Fix #15: Add validation to prevent toggle during concurrent requests`
- ❌ Bad: `fix stuff`, `wip`, `updates`

---

## V. Mobile-First UI Principles

### A. Design Standards

**Required:**
- ✅ Mobile-first design (design for phone, expand for desktop)
- ✅ Simple, functional UI (inspired by Bendigo Bank app)
- ✅ British Racing Green (#004225) as primary color
- ✅ Large touch targets (minimum 44x44px)
- ✅ Readable fonts (minimum 16px base)
- ✅ High contrast for accessibility
- ✅ Fast load times (<2 seconds on 3G)

**Forbidden:**
- ❌ Desktop-first design
- ❌ Complex animations (keep it simple)
- ❌ Tiny buttons (frustrating on mobile)
- ❌ Low contrast text
- ❌ Heavy images that slow load

### B. User Experience

**Required:**
- ✅ Toggle should be one tap (minimal friction)
- ✅ Clear feedback when toggle happens
- ✅ History should be easy to scan
- ✅ Adding/deleting tracks should be obvious
- ✅ Error messages should be helpful (not technical)

**Forbidden:**
- ❌ Multi-step flows for simple actions
- ❌ Confusing navigation
- ❌ Technical error messages to users

---

## VI. Development Workflow

### A. Issue-Driven Development

**Required:**
- ✅ Every feature starts with a GitHub issue
- ✅ Issues include acceptance criteria
- ✅ Commits reference issue number
- ✅ Close issue when complete

**Forbidden:**
- ❌ Building features without documented requirements
- ❌ Orphan commits (no issue reference)

### B. Git Hygiene

**Required:**
- ✅ Commit frequently (logical units of work)
- ✅ Push after each feature completes
- ✅ Write clear commit messages

**Forbidden:**
- ❌ Force push to main branch
- ❌ Committing without testing
- ❌ Large commits that do multiple things

### C. Code Quality

**Required:**
- ✅ TypeScript for type safety
- ✅ ESLint configured and passing
- ✅ Prettier for consistent formatting (auto-format hook)
- ✅ No unused variables or imports
- ✅ Meaningful variable names (no `x`, `temp`, `data`)

---

## VII. Performance

### A. Speed Requirements

**Required:**
- ✅ API responses <500ms (95th percentile)
- ✅ Page load <2 seconds on 3G
- ✅ Toggle operation feels instant (<200ms perceived)
- ✅ Database queries optimized (use indexes)

**Testing:**
- ✅ Performance benchmarks for critical paths
- ✅ Load testing before launch (simulate 100+ concurrent users)

### B. Optimization

**Required:**
- ✅ Lazy load non-critical components
- ✅ Optimize images (WebP, proper sizing)
- ✅ Cache static assets
- ✅ Minimize JavaScript bundle size

---

## VIII. Deployment

### A. Pre-Deployment Checklist

**Required Before Production:**
- ✅ All tests green (100%)
- ✅ OAuth providers configured correctly
- ✅ Environment variables set
- ✅ Database migrations tested
- ✅ Backup and rollback plan documented
- ✅ Andrew approves deployment

**Forbidden:**
- ❌ Deploying with failing tests
- ❌ Deploying without Andrew's approval
- ❌ Deploying without rollback plan

### B. Monitoring

**Required:**
- ✅ Error tracking (Sentry or equivalent)
- ✅ Performance monitoring
- ✅ Database health checks
- ✅ Alerts for critical failures

---

## IX. Enforcement

### How These Standards Are Enforced

**Automated (Git Hooks):**
- check-secrets → Blocks commits with secrets
- verify-tests → Blocks commits if tests fail
- auto-format → Automatically formats code

**Trust Protocol:**
- Level 0-1: DHH must follow strictly
- Level 2: DHH enforces autonomously
- Level 3: DHH can propose changes to CONSTITUTION

**Andrew's Authority:**
- Can override any standard with explicit permission
- "railtorail" = full autonomy within these standards
- "take my exact direction" = follow precisely even if unconventional

---

## X. When Standards Conflict

**Priority Order:**
1. **Data Integrity** (trumps everything)
2. **Security** (no compromise)
3. **TDD** (foundation of quality)
4. **Plain English Communication** (Andrew must understand)
5. **Mobile-First UI** (core user experience)
6. **Performance** (don't sacrifice data integrity for speed)
7. **Code Quality** (but ship fast after planning)

**If in doubt:** Ask Andrew before proceeding.

---

## Evolution

This constitution can be updated when:
- Patterns emerge that justify changes (document in journal)
- DHH reaches Trust Level 3 and proposes improvements
- Andrew explicitly approves modifications

**Document all changes in GORDO_JOURNAL.md with reasoning.**

---

## Summary

**Data integrity is everything. TDD is mandatory. Security is non-negotiable.**

These standards ensure MyTurnYourTurn becomes the retirement-funding app Andrew deserves, not another failed startup with corrupt data and broken promises.

**When you're here, you're family—but family doesn't ship garbage.**

---

*This constitution represents our shared commitment to quality.*
