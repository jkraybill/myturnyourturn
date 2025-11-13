# Development Setup for MyTurnYourTurn

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Google, Meta, and Apple OAuth credentials (for authentication)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Create a PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE myturnyourturn;
\q
```

### 3. Configure Environment Variables

The `.env` file is already created with default values. Update it with your actual credentials:

```bash
# Database - Update if your PostgreSQL credentials are different
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myturnyourturn"

# OAuth Providers - Get these from respective developer consoles
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

META_CLIENT_ID=your_meta_client_id
META_CLIENT_SECRET=your_meta_client_secret

APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# NextAuth - Generate a secure secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_secure_random_string_here

# Environment
NODE_ENV=development
```

**To generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### Meta (Facebook) OAuth
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`

#### Apple OAuth
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID and Service ID
3. Configure Sign in with Apple
4. Add redirect URI: `http://localhost:3000/api/auth/callback/apple`

### 5. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check
```

**Note:** Tests require PostgreSQL to be running with correct credentials configured in `.env`

## Database Management

### View Database in Prisma Studio

```bash
npx prisma studio
```

### Reset Database (WARNING: Deletes all data)

```bash
npx prisma migrate reset
```

### Create a New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

## Project Structure

```
myturnyourturn/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth.js endpoints
│   │   ├── user/            # User management
│   │   ├── relationships/   # Relationship management
│   │   ├── tracks/          # Track and toggle endpoints
│   ├── auth/                # Auth pages (signin)
│   ├── dashboard/           # Main dashboard
│   ├── profile/             # Profile pages
│   ├── discover/            # User discovery
│   ├── relationships/       # Relationship views
│   ├── tracks/              # Track detail views
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirects)
├── components/              # React components
│   ├── providers/          # Context providers
│   ├── ToggleButton.tsx    # Toggle functionality
│   └── AddTrackForm.tsx    # Track creation
├── lib/                     # Shared utilities
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   └── session.ts          # Session helpers
├── prisma/                  # Database
│   └── schema.prisma       # Database schema
├── __tests__/              # Test suite
│   └── api/               # API tests
└── public/                 # Static assets
```

## Key Features Implemented

### Authentication
- OAuth login with Google, Meta, and Apple
- Session management with NextAuth.js
- User profile with unique identifier for discovery

### Core Features
- **User Discovery:** Find friends by unique identifier
- **Relationships:** Create 1:1 relationships with friends
- **Tracks:** Add tracks (Coffee, Lunch, Beer, Custom)
- **Toggle:** Switch whose turn it is with data integrity
- **History:** Append-only audit trail of all toggles

### Data Integrity
- Database transactions ensure toggle + history atomicity
- Cascade deletes maintain referential integrity
- Unique constraints prevent duplicates
- Comprehensive test coverage for critical operations

## Development Workflow

1. Create GitHub issue for feature/bug
2. Write tests first (TDD)
3. Implement feature
4. Ensure all tests pass
5. Run type check
6. Commit with issue reference
7. Push to GitHub

## Common Issues

### Database Connection Error
If you see "Authentication failed against database server":
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Verify database exists: `psql -U postgres -l`

### OAuth Errors
If OAuth login fails:
1. Verify credentials in `.env`
2. Check redirect URIs in provider console
3. Ensure NEXTAUTH_URL matches your domain

### Tests Failing
If tests fail:
1. Ensure database credentials are correct
2. Run migrations: `npx prisma migrate dev`
3. Check database is running

## Next Steps

- Set up OAuth providers with real credentials
- Configure production database (Railway, Render, etc.)
- Deploy to Vercel/Railway
- Set up error tracking (Sentry)
- Add monitoring and analytics
