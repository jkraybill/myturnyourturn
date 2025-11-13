# Quick Deployment Checklist

Use this checklist as you deploy. Check off each item as you complete it.

## Pre-Deployment
- [ ] Code is working locally (`npm run dev` works)
- [ ] All tests pass (`npm test` shows all green)
- [ ] You have a GitHub account

## GitHub (5 min)
- [ ] Created repository on GitHub
- [ ] Pushed code to GitHub
- [ ] Repository URL: ___________________________

## Database - Neon (10 min)
- [ ] Created Neon account at https://neon.tech
- [ ] Created project named "myturnyourturn"
- [ ] Copied **pooled** connection string
- [ ] Connection string saved somewhere safe: ___________________________

## Google OAuth (15 min)
- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth credentials
- [ ] Copied Client ID: ___________________________
- [ ] Copied Client Secret: ___________________________

## Vercel Deployment (15 min)
- [ ] Created Vercel account at https://vercel.com
- [ ] Imported GitHub repository
- [ ] Added environment variable: `DATABASE_URL`
- [ ] Added environment variable: `NEXTAUTH_SECRET` (generated with `openssl rand -base64 32`)
- [ ] Added environment variable: `GOOGLE_CLIENT_ID`
- [ ] Added environment variable: `GOOGLE_CLIENT_SECRET`
- [ ] Added environment variable: `NEXTAUTH_URL` (will update after deploy)
- [ ] Clicked "Deploy"
- [ ] Deployment succeeded ✓
- [ ] Your app URL: ___________________________

## Post-Deployment Configuration
- [ ] Updated `NEXTAUTH_URL` in Vercel to your actual app URL
- [ ] Updated Google OAuth redirect URIs with actual Vercel URL
- [ ] Ran database migrations: `npx prisma migrate deploy`

## Testing
- [ ] Visited your app URL
- [ ] "Try Demo Mode" works
- [ ] "Sign in with Google" works
- [ ] Created a test relationship
- [ ] Toggled a track successfully

## 🎉 You're Live!

Your app URL: ___________________________

Share it with friends and start tracking whose turn it is!

---

## Common Issues

**Build fails on Vercel**
- Check that `postinstall` script is in package.json
- Verify all environment variables are set
- Check Vercel build logs for specific error

**Can't sign in with Google**
- Verify redirect URIs exactly match (including https://)
- Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set
- Make sure you're not in incognito mode

**Database errors**
- Verify DATABASE_URL is the **pooled** connection from Neon
- Run `npx prisma migrate deploy` to set up tables
- Check Neon dashboard that database is active

---

Need help? Check `DEPLOYMENT.md` for detailed instructions!
