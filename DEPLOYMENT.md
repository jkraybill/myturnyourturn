# MyTurnYourTurn - Deployment Guide

This guide will walk you through deploying your app to the internet, step by step.

## What You'll Need
- A GitHub account (free)
- A Vercel account (free, sign up with GitHub)
- A Neon account (free, sign up with GitHub)
- A Google Cloud account (free, for OAuth login)
- About 45-60 minutes

---

## Part 1: Push Your Code to GitHub (5 minutes)

### 1.1 Create a GitHub Repository
1. Go to https://github.com/new
2. Repository name: `myturnyourturn`
3. Make it **Private** (recommended for now)
4. **DON'T** initialize with README (we already have code)
5. Click "Create repository"

### 1.2 Push Your Code
GitHub will show you commands. Run these in your terminal:

```bash
cd /home/jkraybill/andrew/myturnyourturn
git remote add origin https://github.com/YOUR-USERNAME/myturnyourturn.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## Part 2: Set Up Database (10 minutes)

### 2.1 Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" and use your GitHub account
3. Click "Create a project"
4. Project name: `myturnyourturn`
5. Region: Choose closest to you (or US East for best free tier)
6. Click "Create Project"

### 2.2 Get Your Database Connection String
1. After project is created, you'll see a connection string
2. It looks like: `postgresql://username:password@host/database?sslmode=require`
3. **COPY THIS ENTIRE STRING** - you'll need it in a moment
4. **IMPORTANT**: Click "Pooled connection" and copy that URL instead (better for serverless)

**Keep this tab open!** You'll need this connection string.

---

## Part 3: Set Up Google OAuth (15 minutes)

### 3.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Project name: `MyTurnYourTurn`
4. Click "Create"
5. Wait for it to create (30 seconds)

### 3.2 Configure OAuth Consent Screen
1. In the left menu: APIs & Services → OAuth consent screen
2. User Type: **External**
3. Click "Create"
4. Fill in required fields:
   - App name: `MyTurnYourTurn`
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. Scopes: Click "Save and Continue" (we don't need any special scopes)
7. Test users: Click "Save and Continue" (optional for now)
8. Click "Back to Dashboard"

### 3.3 Create OAuth Credentials
1. In left menu: APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `MyTurnYourTurn Web`
5. Authorized JavaScript origins:
   - Click "Add URI"
   - Add: `http://localhost:3000` (for local development)
   - Click "Add URI" again
   - Add: `https://YOUR-APP-NAME.vercel.app` (we'll update this later)
6. Authorized redirect URIs:
   - Click "Add URI"
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Click "Add URI" again
   - Add: `https://YOUR-APP-NAME.vercel.app/api/auth/callback/google`
7. Click "Create"

### 3.4 Save Your Credentials
You'll see a popup with:
- **Client ID**: Looks like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-abcdefghijklmnop`

**COPY BOTH OF THESE** - you'll need them in the next step!

---

## Part 4: Deploy to Vercel (15 minutes)

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up" and use your GitHub account
3. Authorize Vercel to access your GitHub

### 4.2 Import Your Repository
1. Click "Add New..." → "Project"
2. Find your `myturnyourturn` repository
3. Click "Import"

### 4.3 Configure Environment Variables
Before deploying, click "Environment Variables" and add these **one by one**:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `DATABASE_URL` | Your Neon connection string | From Part 2 (Neon dashboard) |
| `NEXTAUTH_URL` | `https://YOUR-APP-NAME.vercel.app` | Will be generated after deploy, update later |
| `NEXTAUTH_SECRET` | Run this: `openssl rand -base64 32` | Generate random string |
| `GOOGLE_CLIENT_ID` | Your Google Client ID | From Part 3.4 |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | From Part 3.4 |

**To generate NEXTAUTH_SECRET on WSL/Linux:**
```bash
openssl rand -base64 32
```

### 4.4 Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" with your app URL
4. **Your app URL will be something like**: `myturnyourturn-abc123.vercel.app`

### 4.5 Update Environment Variables
1. Copy your new Vercel URL
2. Go to your Vercel project → Settings → Environment Variables
3. Find `NEXTAUTH_URL` and click "Edit"
4. Update it to your actual Vercel URL (e.g., `https://myturnyourturn-abc123.vercel.app`)
5. Click "Save"

### 4.6 Update Google OAuth Redirect URIs
1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Update the placeholder `YOUR-APP-NAME.vercel.app` with your actual URL
4. Click "Save"

### 4.7 Run Database Migrations
1. In Vercel, go to your project
2. Click on the latest deployment
3. Click "View Function Logs"
4. You need to run migrations manually

**Option A: From your local machine (easiest)**
```bash
# Update your .env file with the production DATABASE_URL from Vercel
# Then run:
npx prisma migrate deploy
```

**Option B: Use Vercel CLI (if comfortable)**
```bash
npm i -g vercel
vercel login
vercel env pull
npx prisma migrate deploy
```

---

## Part 5: Test Your App! (5 minutes)

1. Visit your Vercel URL (e.g., `https://myturnyourturn-abc123.vercel.app`)
2. Click "Try Demo Mode" - this should work immediately!
3. Try signing in with Google
4. Test creating relationships and toggling tracks

---

## Troubleshooting

### "Sign in with Google" doesn't work
- Check that your Google OAuth redirect URI exactly matches your Vercel URL
- Make sure you're not in an incognito window (some OAuth issues there)
- Check Vercel logs for errors: Project → Deployments → Click deployment → View Function Logs

### Database errors
- Verify your DATABASE_URL in Vercel environment variables
- Make sure you ran `npx prisma migrate deploy`
- Check Neon dashboard to see if database is active

### App won't load at all
- Check Vercel deployment logs for build errors
- Make sure all environment variables are set
- Try redeploying: Vercel → Deployments → Click "..." → "Redeploy"

### Demo mode works but can't sign in
- Check that `NEXTAUTH_URL` matches your Vercel URL exactly (including https://)
- Verify `NEXTAUTH_SECRET` is set
- Check Google OAuth credentials are correct

---

## Costs & Limits

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Neon**: 0.5GB storage, 1 project, always-on database
- **Google OAuth**: Unlimited logins

### When You'll Need to Pay
- **Vercel**: If you exceed 100GB bandwidth (~10,000 visitors/month)
- **Neon**: If you exceed 0.5GB storage (~1,000+ active users with full data)

### Upgrade Path
If your app gets popular:
1. Neon Pro: $20/month (5GB storage, backups, better performance)
2. Vercel Pro: $20/month (1TB bandwidth, better support)

---

## Next Steps (Optional)

### Add a Custom Domain
1. Buy a domain from Namecheap/Google Domains (~$12/year)
2. In Vercel: Settings → Domains → Add your domain
3. Follow Vercel's DNS instructions
4. Update Google OAuth redirect URIs with your custom domain

### Add Meta/Apple Login
- Similar process to Google OAuth
- Meta: https://developers.facebook.com
- Apple: https://developer.apple.com

### Monitor Your App
- Vercel Analytics: See visitor stats
- Vercel Logs: Debug errors
- Neon Monitoring: Watch database usage

---

## Getting Help

If you get stuck:
1. Check Vercel deployment logs
2. Check browser console for errors (F12 → Console)
3. Google the error message
4. Ask on Vercel Discord: https://vercel.com/discord
5. Check Next.js docs: https://nextjs.org/docs

Good luck! 🚀
