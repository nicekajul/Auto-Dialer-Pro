# Auto-Dialer Pro - Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended) ⭐
- **Pros**: One-click deployment, automatic HTTPS, preview deployments, free tier available
- **Time**: 5 minutes
- **Cost**: Free tier or $20/month pro

### Option 2: Self-Hosted
- **Pros**: Full control, no vendor lock-in
- **Time**: 15-30 minutes
- **Cost**: $5-50/month depending on platform

### Option 3: Docker
- **Pros**: Containerized, portable, scalable
- **Time**: 20 minutes
- **Cost**: $10-100/month

---

## 🟢 Vercel Deployment (Fastest)

### Prerequisites
- GitHub account
- Vercel account (free)
- Code pushed to GitHub

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Auto-Dialer Pro"

# Create new repository on GitHub
# Copy the URL from GitHub

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/auto-dialer-pro.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Select your GitHub repository
4. Click **"Import"**
5. Configure settings:
   - **Project Name**: `auto-dialer-pro` (or your preference)
   - **Framework**: `Next.js` (auto-detected)
   - **Root Directory**: `./` (default)

### Step 3: Add Environment Variables

In Vercel dashboard:

1. Go to your project **"Settings" → "Environment Variables"**
2. Add three variables:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your_client_secret (KEEP PRIVATE!)
NEXT_PUBLIC_GOOGLE_REDIRECT_URI = https://auto-dialer-pro.vercel.app/api/auth/google-callback
```

**Important**: Replace `auto-dialer-pro` with your actual Vercel project name

### Step 4: Update Google OAuth

In [Google Cloud Console](https://console.cloud.google.com):

1. Go to **Credentials**
2. Find your OAuth 2.0 Client ID
3. Click to edit
4. Add to **Authorized Redirect URIs**:
   - `https://auto-dialer-pro.vercel.app/api/auth/google-callback`
5. Save

### Step 5: Trigger Deployment

```bash
# Option A: Push new commit
git commit --allow-empty -m "Trigger deployment"
git push

# Option B: Manual redeploy from Vercel dashboard
# Click "Deploy" button
```

**Done!** Your app is live at `https://auto-dialer-pro.vercel.app`

---

## 🟡 Self-Hosted on DigitalOcean App Platform

### Prerequisites
- DigitalOcean account
- GitHub repository
- Credit card for payment

### Step 1: Connect GitHub

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Select **"GitHub"**
4. Authorize DigitalOcean
5. Select your repository
6. Click **"Next"**

### Step 2: Configure

1. **Source Branch**: Select `main`
2. **App Name**: `auto-dialer-pro`
3. **HTTP Port**: `3000`
4. Click **"Next"**

### Step 3: Add Environment Variables

In the "Environment" section:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://auto-dialer-pro.ondigitalocean.app/api/auth/google-callback
```

### Step 4: Choose Plan

- **Starter**: $5/month (sufficient)
- **Basic**: $10/month (recommended)
- **Professional**: $20+/month

### Step 5: Deploy

1. Click **"Create Resources"**
2. Wait for deployment (2-3 minutes)
3. Copy the assigned domain

### Step 6: Update Google OAuth

In Google Console, add your new domain to redirect URIs:
```
https://your-app.ondigitalocean.app/api/auth/google-callback
```

---

## 🟣 Self-Hosted on Railway.app

### Prerequisites
- Railway account (free tier available)
- GitHub repository

### Step 1: Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway
5. Select your repository

### Step 2: Configure Variables

Railway should auto-detect `package.json`. Add environment variables:

1. Go to **"Variables"** tab
2. Add:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build and deployment
3. Copy the generated URL

### Step 4: Update Google OAuth

Add the Railway URL to Google Console redirect URIs.

---

## 🟠 Docker Deployment

### Prerequisites
- Docker installed
- Docker Hub account (optional)

### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

```
.git
.next
node_modules
.env.local
.env
npm-debug.log
```

### Step 3: Build Docker Image

```bash
# Build
docker build -t auto-dialer-pro:latest .

# Test locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id \
  -e GOOGLE_CLIENT_SECRET=your_secret \
  -e NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback \
  auto-dialer-pro:latest
```

### Step 4: Push to Docker Hub

```bash
# Tag
docker tag auto-dialer-pro:latest username/auto-dialer-pro:latest

# Push
docker push username/auto-dialer-pro:latest
```

### Step 5: Deploy to Production

Deploy the Docker image to:
- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Instances**
- **Your own server with Docker**

Example with Google Cloud Run:
```bash
gcloud run deploy auto-dialer-pro \
  --image gcr.io/your-project/auto-dialer-pro:latest \
  --set-env-vars NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id \
  --set-env-vars GOOGLE_CLIENT_SECRET=your_secret \
  --port 3000
```

---

## 🔧 Post-Deployment Checklist

### 1. Verify Deployment
- [ ] App loads at your domain
- [ ] Login page displays
- [ ] No 500 errors in console

### 2. Test Google OAuth
- [ ] Click "Sign in with Google"
- [ ] Redirects to Google login
- [ ] Returns to setup modal
- [ ] Can enter spreadsheet ID

### 3. Test Core Functionality
- [ ] Load your Google Sheet
- [ ] See leads in queue
- [ ] Click-to-dial button works
- [ ] Can record call outcomes
- [ ] Data syncs back to sheet

### 4. Monitor Errors
- [ ] Check logs for errors
- [ ] Verify no console errors
- [ ] Monitor for rate limiting

### 5. Security Review
- [ ] HTTPS is enabled
- [ ] Secrets not exposed
- [ ] OAuth tokens secure
- [ ] Logout clears cookies

### 6. Performance Check
- [ ] Page loads < 2 seconds
- [ ] Sync works (5 sec cycle)
- [ ] No 404 errors
- [ ] API responses < 500ms

---

## 📊 Monitoring & Logs

### Vercel
- **Dashboard**: vercel.com → Project → Analytics
- **Logs**: vercel.com → Project → Logs
- **Monitoring**: Automatic health checks

### DigitalOcean
- **Logs**: App Platform → Logs tab
- **Metrics**: App Platform → Monitoring
- **Alerts**: Set up notifications

### Railway.app
- **Logs**: Project → Logs tab
- **Metrics**: Project → Metrics
- **Deployments**: Full history available

---

## 🔄 Continuous Deployment

### Automatic Updates

All platforms support automatic deployment on push:

```bash
# Make changes
git add .
git commit -m "Feature: Add new capability"
git push origin main

# Deployment starts automatically!
```

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard abc123
git push --force-with-lease
```

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid | CPU | Memory | Notes |
|----------|-----------|------|-----|--------|-------|
| **Vercel** | Yes (150GB/month) | $20/mo | Shared | Shared | Best for Next.js |
| **Railway** | Yes ($5/mo) | Pay as you go | Shared | 512MB | Developer friendly |
| **DigitalOcean** | No | $5+/mo | Shared | 512MB+ | Good value |
| **AWS** | 12 months free | Varies | Varies | Varies | Most complex |
| **Heroku** | No | $5+/mo | Shared | 512MB | Easy deployment |

### Estimated Monthly Costs
- **Small team (1-2 agents)**: $0-10/month
- **Medium team (3-10 agents)**: $10-30/month
- **Large team (10+ agents)**: $30-100/month

---

## 🚨 Troubleshooting Deployment

### Issue: "Cannot GET /dashboard"

**Cause**: App deployed but not accessible
**Solution**:
1. Check environment variables are set
2. Verify `npm run build` completes
3. Check logs for build errors

### Issue: "OAuth error"

**Cause**: Redirect URI mismatch
**Solution**:
1. Copy exact domain from deployment
2. Update Google Console with new domain
3. Wait 5 minutes for propagation
4. Clear browser cookies and try again

### Issue: "Cannot access spreadsheet"

**Cause**: Auth token issues
**Solution**:
1. Verify OAuth token is valid
2. Check Google Sheet permissions
3. Try signing out and back in
4. Check browser console for errors

### Issue: "Slow performance"

**Cause**: Too many leads or slow network
**Solution**:
1. Reduce leads in sheet (test with < 100)
2. Check Google Sheets API quota
3. Verify network connectivity
4. Consider upgrading plan

---

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Google OAuth redirect URI updated
- [ ] Domain HTTPS verified
- [ ] Test OAuth flow
- [ ] Load test with sample leads
- [ ] Verify all features work
- [ ] Monitor logs for errors
- [ ] Set up error notifications
- [ ] Train team on access
- [ ] Document deployment details

---

## 🎯 Deployment Quick Reference

### Vercel (Fastest)
```bash
# Push to GitHub → Auto-deploys
# Add env vars in Vercel dashboard
# Update Google OAuth → Done!
```

### DigitalOcean
```bash
# Create App → Select GitHub → Configure → Deploy
# Takes ~5 minutes
```

### Railway
```bash
# Connect GitHub → Set env vars → Deploy
# Takes ~3 minutes
```

### Docker
```bash
# docker build → docker push → Deploy image
# Platform-dependent timing
```

---

## 📞 Support

### Pre-Deployment
- Check QUICKSTART.md for setup issues
- Verify Google OAuth configuration
- Test locally with `npm run dev`

### Post-Deployment
- Check platform-specific logs
- Verify environment variables
- Test with fresh incognito window
- Review browser console

### Ongoing
- Monitor deployment logs daily
- Set up error alerts
- Plan monthly updates
- Regular security audits

---

**Last Updated**: February 2026  
**Next Review**: May 2026
