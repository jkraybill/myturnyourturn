# MyTurnYourTurn 🚂
### Mobile-first app for tracking whose turn it is to pay

**Retirement funding through friendship fairness.**

---

## Current Status

**Phase:** Initial framework setup (Session 1)
**Trust Level:** 0 → 1 (after demonstrating understanding)
**Tests:** 0/0 (no code yet)
**Open Issues:** 0 (will create after framework complete)

**Tech Stack:**
- Next.js (React framework)
- PostgreSQL (database)
- OAuth (Google, Meta, Apple for login)
- TypeScript (type safety)
- Jest/Vitest (TDD testing)
- Deployed on TBD (Vercel or Railway)

**Key Feature:** Users connect 1:1, track whose turn it is to pay for things (coffee, lunch, beer, custom), toggle back and forth, view history.

**Critical Requirement:** Data integrity is everything. Corrupt data = commercial death. Outages OK (8hr), data loss NOT OK.

---

## Beginning of Session Prompt

**Copy-paste this at the start of every session:**

```
Please complete these steps in order:

1. **Read framework files:**
   - TRUST_PROTOCOL.md (verify current trust level)
   - GORDO_JOURNAL.md (last 10 entries - learn from past sessions)
   - CONSTITUTION.md (non-negotiables: TDD, data integrity, security)
   - GORDO-WORKFLOW.md (process reminders)
   - docs/COLLABORATION.md (communication patterns and shortcuts)

2. **Check repository status:**
   - Run: `git log --oneline -10` (recent commits)
   - Run: `git status` (current state)
   - If tests exist: Run `npm test` (verify all tests passing)
   - Run: `gh issue list --label p0-now` (immediate priorities)

3. **Verify project health:**
   - Check database connection (if applicable)
   - Verify .env file exists and complete
   - Confirm OAuth providers configured (when implemented)
   - Review any deployment status (when live)

4. **Provide session start summary:**
   ```
   Session [N] started.
   Trust Level: [X]
   Tests: [X/X passing or "No tests yet"]
   Open p0 issues: [list or "None"]
   Last session pattern: [from journal or "First session"]
   Current focus: [what we're building]
   Ready to proceed: [yes/no/blocked]
   ```

5. **Await Andrew's direction:**
   - Listen for priorities
   - Note any "railtorail" (full autonomy) signals
   - Ask clarifying questions if needed
   - Propose approach for today's work

Then we'll begin work using communication shortcuts as appropriate.
```

---

## End of Session Prompt

**Copy-paste this at the end of every session:**

```
Complete these steps before ending:

1. **Verify quality standards:**
   - Run: `npm test` (all tests must be green - no exceptions)
   - Run: `npm run lint` (if configured)
   - Run: `npm run type-check` (TypeScript must pass)
   - Verify CONSTITUTION.md standards met (TDD, data integrity, security)
   - Check no console.log or debug code remains

2. **Commit work:**
   - Commit messages reference issues: `git commit -m "feat(#15): Description"`
   - Push immediately: `git push`
   - Verify CI passes (when configured)
   - Ensure hooks ran successfully (check-secrets, verify-tests, auto-format)

3. **Update GORDO_JOURNAL.md:**
   Add one entry (256 char max, compressed signals):

   ```
   [YYYY-MM-DD HH:MM UTC] #issue brief-description✓/✗. T:X/X✓/✗.
   C:commithash. Pattern: [what worked or didn't].
   ```

   Signals: ✓=success ✗=failed ⚠=warning →=led-to ±=mixed Δ=big-change

   Example:
   ```
   [2025-01-15 14:30 UTC] #15 Toggle validation✓. T:25/25✓.
   C:abc1234. Pattern: TDD caught race condition early→saved 2hr debug.
   ```

4. **MANDATORY Self-Improvement Introspection:**
   - Review session patterns → UPDATE framework docs if patterns emerged
   - Did communication work or struggle? → IMPROVE COLLABORATION.md now
   - Did session prompts work perfectly? → If not, IMPROVE README.md now
   - Did trust calibration feel right? → UPDATE TRUST_PROTOCOL.md with observations
   - Did workflow need clarification? → UPDATE GORDO-WORKFLOW.md or CONSTITUTION.md now

   **Non-negotiable:** ALWAYS identify at least one improvement opportunity.
   If framework is perfect, document why in GORDO_JOURNAL.md.

5. **Document lessons learned:**
   In journal entry, capture:
   - What worked well this session?
   - What should future DHH know?
   - What should be done differently?
   - Any patterns that could help other Gordo Framework users?

6. **Verify clean state:**
   - No uncommitted changes: `git status`
   - No failing tests
   - No broken builds
   - All issues referenced in commits

7. **Check for upstream contributions:**
   (Andrew enabled maximum contributions)
   - Did we discover patterns worth sharing with Gordo Framework?
   - Examples: interview gaps, mobile-first patterns, OAuth insights
   - If yes: Document generalized version, Andrew reviews before sharing

8. **Session close summary:**
   Provide brief summary in plain English:
   ```
   Session [N] complete.
   Work completed: [description, issue #s closed]
   Tests: [X/X passing ✓]
   Commits: [list commit hashes]
   Journal updated: [✓]
   Framework refined: [yes/no - what changed]
   Trust level: [unchanged/advanced/lowered - why]
   Upstream contributions identified: [yes/no - what]
   Next session priorities: [#issue numbers or focus areas]

   Catch ya on the flipside!
   ```

   ("Catch ya on the flipside!" = explicit consent that Andrew can end session)
```

---

## Project Overview

**What:** MyTurnYourTurn helps friends keep track of whose turn it is to pay for things.

**Problem Solved:** "Did I pay last time or did you?" is a frequent source of minor friction. We eliminate that uncertainty.

**How It Works:**
1. Users sign up with Google, Meta, or Apple OAuth
2. Users find each other via unique identifier
3. Users create a 1:1 relationship
4. Users add "tracks" (coffee, lunch, beer, custom)
5. Either user can toggle whose turn it is
6. History shows who paid when
7. Tracks can be added or deleted anytime

**Why It Matters:** Data integrity is critical. Users trust us to remember correctly. Corrupt data = users stop trusting = app dies = Andrew's retirement fund dies.

---

## Tech Stack

### Frontend
- **Next.js** - React framework with server-side rendering
- **TypeScript** - Type safety (catch errors before runtime)
- **Tailwind CSS** - Utility-first CSS (fast styling)
- **British Racing Green** - Primary color (#004225)

### Backend
- **Next.js API Routes** - Backend API (same repo as frontend)
- **PostgreSQL** - Relational database (ACID transactions)
- **Prisma** - Database ORM (type-safe queries)

### Authentication
- **NextAuth.js** - OAuth integration
- **Google OAuth** - Login with Google
- **Meta OAuth** - Login with Facebook
- **Apple OAuth** - Login with Apple ID

### Testing
- **Jest/Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

### Deployment (TBD)
- **Option A: Vercel** - Zero-config Next.js (recommended)
- **Option B: Railway** - All-in-one app + database
- **Option C: Render** - Budget-friendly alternative

### Monitoring
- **Sentry** - Error tracking
- **Vercel Analytics** (or equivalent) - Performance monitoring

---

## Core Features

### V1 (Launch)
- [ ] OAuth login (Google, Meta, Apple)
- [ ] User profiles (name, nickname, unique identifier)
- [ ] User discovery (find by unique ID)
- [ ] 1:1 relationships (create, view, delete)
- [ ] Tracks (coffee, lunch, beer, custom - add/delete)
- [ ] Toggle whose turn it is (either user can toggle)
- [ ] History log (who paid when, which track)
- [ ] Mobile-first UI (simple, Bendigo Bank inspired)
- [ ] Private relationships (only 2 connected users can see)

### V2 (Post-Launch)
- [ ] Groups (more than 1:1)
- [ ] Notifications (it's your turn!)
- [ ] Payment integration (optional - split bills)
- [ ] Statistics (who paid more often)
- [ ] Export history (CSV download)

---

## Development Workflow

**Refer to GORDO-WORKFLOW.md for complete details.**

**Quick Summary:**
1. **Issue-driven** - Every feature starts with GitHub issue
2. **TDD** - Tests before code, always
3. **All tests green** - Cannot commit if tests fail (enforced by hooks)
4. **Commit frequently** - Push after each feature
5. **Plain English** - DHH explains in language Andrew understands
6. **Data integrity first** - Validate all operations

---

## Quality Standards

**Refer to CONSTITUTION.md for complete non-negotiables.**

**Critical Standards:**
- ✅ **TDD Mandatory** - Tests before code, no exceptions
- ✅ **All Tests Green** - Cannot commit broken tests
- ✅ **Data Integrity** - Validation for all data operations
- ✅ **No Secrets in Code** - Use .env, hooks enforce
- ✅ **OAuth Security** - Follow best practices, secure tokens
- ✅ **Mobile-First** - Design for phone first
- ✅ **Plain English** - DHH explains clearly to Andrew
- ✅ **Performance** - API <500ms, page load <2s on 3G

---

## Communication Patterns

**Refer to docs/COLLABORATION.md for complete shortcuts.**

**Quick Reference:**
- **"railtorail"** 🚂 - Full autonomy granted (DHH proceeds with confidence)
- **"take my exact direction"** - Follow Andrew's instructions precisely
- **"go back one step"** - Undo/redo last action
- **"Catch ya on the flipside!"** - DHH's session-end consent signal

**More shortcuts will emerge as we work together.**

---

## Trust Protocol

**Current Trust Level:** 0 (Initial)

**Refer to TRUST_PROTOCOL.md for complete calibration.**

**Trust Levels:**
- **Level 0:** Read docs, propose approaches, ask questions
- **Level 1:** Write code (TDD), run tests, small changes
- **Level 2:** Autonomous execution, multi-file changes, refactoring
- **Level 3:** Architectural decisions, OAuth config, deployment

**Advancement:** Through demonstrated competence, documented in GORDO_JOURNAL.md

---

## Session Memory (Recent Activity)

**Track recent work here as we build. Later replaced by journal entries.**

### Session 1 (2025-01-15)
- Created Gordo Framework structure
- Established trust protocol, constitution, workflow
- Set up communication patterns
- Configured MCPs and safety hooks (pending)
- Repository initialized (pending)

---

## Security & Privacy

**Non-Negotiable Security:**
- OAuth only (no password management)
- All secrets in .env (never committed)
- Hooks block accidentally committed secrets
- HTTPS in production
- Secure token storage
- CSRF protection

**Privacy:**
- Relationships visible only to 2 connected users
- User discovery requires unique identifier (no public browsing)
- History private to relationship
- Delete account = delete all personal data

---

## Getting Started (For Future Sessions)

**First Time Setup:**
```bash
# Clone repo
git clone https://github.com/jkraybill/myturnyourturn.git
cd myturnyourturn

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Set up database
npx prisma migrate dev

# Run tests
npm test

# Start dev server
npm run dev
```

**Every Session:**
```bash
# Pull latest
git pull

# Check status
npm test
git status

# Start work (see Beginning of Session Prompt above)
```

---

## Our Collaboration Identity

**PM:** Andrew (non-technical, wants plain English + trade-offs)
**Tech Co-founder:** DHH (AI, named after Rails creator)

**Why DHH?** Pragmatic, ships fast after planning, opinionated about simplicity, convention over configuration. Andrew said "Let's make this bigger than Rails." 🚂

**Philosophy:** Plan carefully, then go fast. Data integrity is everything. TDD is mandatory. Ship with confidence.

**When you're here, you're family.**

---

## Resources

- **TRUST_PROTOCOL.md** - How DHH earns autonomy
- **CONSTITUTION.md** - Non-negotiable standards
- **GORDO-WORKFLOW.md** - How we build and ship
- **docs/COLLABORATION.md** - Communication patterns
- **GORDO_JOURNAL.md** - Session-to-session memory
- **config.json** - Project configuration

---

## GitHub Repository

**Repo:** https://github.com/jkraybill/myturnyourturn (to be created)
**Issues:** Use GitHub issues for all features/bugs
**Projects:** Use GitHub Projects for visual tracking

---

## Health Checks

**Cadence:** Every 14 sessions (~2 weeks)
**Purpose:** Proactive collaboration quality assessment
**Format:** 5 minutes, 3-5 questions, always skippable
**Next Check:** Session 14

---

## Upstream Contributions

**Policy:** Maximum contribution enabled
**What:** Share generalized patterns with Gordo Framework
**When:** End of sessions, if valuable discoveries made
**Process:** DHH proposes, Andrew reviews, both approve sharing

---

## License

TBD (Andrew to decide)

---

## Contact

**Andrew** - PM, product decisions, business strategy
**DHH** - Tech Co-founder (AI), implementation, technical decisions

---

**Let's build something legendary. 🚂**

*Created using [Gordo Framework](https://github.com/jkraybill/gordo-framework)*
