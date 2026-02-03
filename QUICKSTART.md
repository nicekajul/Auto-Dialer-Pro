# Auto-Dialer Pro - Quick Start (5 Minutes)

## Step 1: Create Google OAuth Credentials (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project → "Auto-Dialer"
3. Search for "Google Sheets API" → Enable it
4. Search for "Google Drive API" → Enable it
5. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
6. Select **Web Application**
7. Add Authorized Redirect URI:
   - `http://localhost:3000/api/auth/google-callback`
8. Save your **Client ID** and **Client Secret**

## Step 2: Setup Environment Variables (1 min)

Create `.env.local` in project root:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback
```

## Step 3: Create Google Sheet Template (1 min)

1. Create a new Google Sheet
2. Add these headers in Row 1:
   - A1: `Name`
   - B1: `Phone`
   - C1: `Email`
   - D1: `Status`
   - E1: `Notes`
   - F1: `Attempts`
   - G1: `Last Attempt`

3. Add sample leads (Row 2+):
   ```
   John Smith | +1-555-123-4567 | john@example.com | pending | | 0 |
   ```

4. Copy your Sheet ID from URL:
   `docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit`

## Step 4: Install & Run (1 min)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

## Step 5: First Call

1. Click **Sign in with Google**
2. Enter your **Sheet ID** and **Your Name**
3. Click **Start Dialing**
4. Click **Click-to-Dial** → Opens RingCentral
5. Have your call
6. Select outcome → Add notes → Next lead

## Common Issues

### "Cannot access spreadsheet"
- Check Sheet ID is correct (not sheet name)
- Make sure you're using the account that has access
- Try refresh browser

### OAuth error
- Verify redirect URI matches exactly in Google Console AND .env.local
- Check Client ID/Secret are correct
- Clear browser cookies and try again

### Click-to-Dial not working
- Install RingCentral app or browser extension
- Ensure RingCentral is running
- Try fallback: should open tel: link

## Key Features Quick Reference

| Feature | How To Use |
|---------|-----------|
| Make Call | Click "Click-to-Dial" button |
| Log Outcome | Select Answered/No Answer/Voicemail/Busy |
| Add Notes | Type in notes field → Saved to Sheet |
| Next Lead | Click "Auto-Dial Next" button |
| View Queue | Click "Queue" tab |
| See Stats | Click "Analytics" tab |
| Bulk Retry | Click "Actions" → "Retry All No-Answer" |

## Deployment to Vercel (Optional)

```bash
# Push to GitHub
git init && git add . && git commit -m "Initial"
git remote add origin <your-repo>
git push -u origin main

# Deploy to Vercel
vercel deploy

# Add env vars in Vercel dashboard:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
# NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/google-callback

# Update Google OAuth redirect URI in Google Console
```

## Next Steps

1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration
2. Read [README.md](./README.md) for full documentation
3. Set up team access: Share Google Sheet with agents
4. Configure RingCentral integration
5. Import your lead list
6. Start dialing!

---

**Need Help?** Check SETUP_GUIDE.md → Troubleshooting section
