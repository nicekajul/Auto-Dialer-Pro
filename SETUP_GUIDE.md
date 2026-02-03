# Auto-Dialer Pro - Setup Guide

## Overview

Auto-Dialer Pro is a web-based sales dialing application that automates call management and lead tracking through Google Sheets integration. The app supports real-time synchronization, multi-agent operations, and comprehensive call analytics.

## Features

✓ **Automatic Dialing** - Sequential lead dialing without manual intervention
✓ **Click-to-Dial Integration** - Direct RingCentral integration via click-to-dial URLs
✓ **Google Sheets Sync** - Real-time lead data and call outcome synchronization
✓ **Multi-Agent Support** - Multiple concurrent users with shared lead pool
✓ **Call Tracking** - Automatic logging of call outcomes (answered, no-answer, voicemail, busy)
✓ **Bulk Actions** - Retry no-answer leads, flag for follow-up, bulk status updates
✓ **Analytics Dashboard** - Real-time call metrics and performance insights
✓ **Agent Notes** - Add contextual notes to each lead during/after calls

## Prerequisites

### 1. Google OAuth Setup

You'll need to set up a Google Cloud project and create OAuth 2.0 credentials:

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (e.g., "Auto-Dialer Pro")
   - Enable the Google Sheets API and Google Drive API

2. **Create OAuth 2.0 Credentials**
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web Application"
   - Set Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google-callback` (development)
     - `https://yourdomain.com/api/auth/google-callback` (production)
   - Save your Client ID and Client Secret

3. **Configure Google Sheets Template**
   - Create a new Google Sheet with columns:
     - A: Name
     - B: Phone
     - C: Email
     - D: Status (pending, answered, no-answer, voicemail, busy)
     - E: Notes
     - F: Attempts
     - G: Last Attempt (auto-populated)
   - Share the sheet with appropriate agents (or keep permissions as needed)

### 2. RingCentral Setup

The app uses RingCentral's click-to-dial functionality, which works with:

- **RingCentral Desktop App** - Download from ringcentral.com
- **RingCentral Browser Extension** - Available for Chrome, Firefox, Safari
- **RingCentral Web App** - Direct integration at app.ringcentral.com

No API credentials needed for click-to-dial mode.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback
```

## Installation & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Add environment variables to .env.local
# Run development server
npm run dev

# Open http://localhost:3000
```

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings:
     - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-project.vercel.app/api/auth/google-callback`
   - Deploy

## Usage

### Initial Setup

1. **Start the app** - Navigate to the home page
2. **Sign in with Google** - Authorize the app to access your Google Sheets
3. **Enter Spreadsheet ID** - Find this in your Google Sheet URL:
   - Format: `docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
4. **Enter Your Name** - Used for agent identification in call logs
5. **Start Dialing** - The app loads your leads and you can begin

### Making Calls

1. **Click-to-Dial** - Click the "Click-to-Dial" button to open RingCentral
2. **Talk to Lead** - Have your conversation
3. **Log Outcome** - After call, select:
   - **Answered** - Successful connection
   - **No Answer** - Call went unanswered
   - **Voicemail** - Left voicemail message
   - **Busy** - Line was busy
4. **Add Notes** - Optional notes about the call
5. **Auto-Next** - Click "Auto-Dial Next" to move to the next pending lead

### Dashboard Navigation

- **Dialer Tab** - Main calling interface with current lead
- **Queue Tab** - View pending and contacted leads
- **Analytics Tab** - Call metrics and performance charts
- **Actions Tab** - Bulk operations and lead management

### Bulk Actions

- **Retry All No-Answer Leads** - Reset no-answer status to pending
- **Flag No-Answer for Follow-up** - Add retry flag to notes
- **Mark All as Contacted** - Bulk status update with attempt increment
- **Reset All** - Clear all data and return to initial state

## Google Sheets Sync Details

### Data Flow

```
Your Browser → Google OAuth → Google Sheets API → Your Sheet
                ↓                    ↓
            Secure Token      Read/Write Access
```

### Column Descriptions

| Column | Purpose | Required | Auto-Updated |
|--------|---------|----------|--------------|
| Name | Lead contact name | Yes | No |
| Phone | Contact phone number | Yes | No |
| Email | Contact email | No | No |
| Status | Call outcome | No | Yes |
| Notes | Agent notes | No | Yes |
| Attempts | Number of call attempts | No | Yes |
| Last Attempt | ISO timestamp of last call | No | Yes |

### Sync Frequency

- **Real-time on action** - Status updates sync immediately
- **Auto-refresh** - Dashboard refreshes every 5 seconds
- **Manual refresh** - Click refresh button to force sync

## Call Outcomes Reference

### Answered
- Lead picked up and had conversation
- Agent can add notes about interaction
- Move to next lead automatically

### No Answer
- Call went to voicemail or was declined
- Can be retried later via bulk actions
- Attempts counter increments

### Voicemail
- Left message on voicemail system
- Tracked separately for analytics
- Useful for follow-up calling

### Busy
- Line was busy/occupied
- Common for high-traffic numbers
- Can retry immediately

## Multi-Agent Setup

### For Team Deployments

1. **Share Google Sheet** - Grant edit access to all agents
2. **Each agent logs in** - Uses their own Google account
3. **Real-time updates** - All agents see updated lead status
4. **Agent attribution** - Notes include agent name (from setup)

### Best Practices

- Assign lead lists to avoid duplicate calls
- Use filters in analytics by date/time to track individual performance
- Review call logs regularly for quality assurance
- Back up important data periodically

## Troubleshooting

### "Cannot access spreadsheet"
- Verify spreadsheet ID is correct (not sheet name)
- Ensure Google account has edit access
- Check OAuth permissions were granted

### Calls not syncing to Sheets
- Verify network connection
- Check access token hasn't expired
- Refresh dashboard to force re-sync
- Check browser console for errors

### Click-to-Dial not opening
- Ensure RingCentral app or extension is installed
- Browser must support custom URL schemes
- Allow pop-ups if using fallback dialer

### Wrong time zone in call logs
- Server uses UTC for timestamp storage
- Local browser time shown in dashboard
- Adjust filters as needed for reporting

## Security Notes

- **OAuth Tokens** - Stored in HTTP-only cookies (cannot be accessed via JavaScript)
- **No Data Storage** - App doesn't store leads on our servers
- **Sheet Permissions** - Handled entirely by Google's permission system
- **SSL/TLS** - Use HTTPS in production (Vercel provides by default)

## Support & Resources

- **Google Sheets API Docs** - https://developers.google.com/sheets/api
- **RingCentral Documentation** - https://developers.ringcentral.com
- **Next.js Documentation** - https://nextjs.org/docs

## Advanced Configuration

### Custom Phone Number Formatting

Edit `/lib/ringcentral-dial.ts` to adjust phone number formatting for your region:

```typescript
// Example: UK phone numbers
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Custom formatting logic here
}
```

### Extending Call Outcomes

To add new call outcome types:

1. Update `Lead` interface in `/lib/google-sheets.ts`
2. Add button in `/components/dashboard/call-panel.tsx`
3. Add color mapping in `/components/dashboard/lead-queue.tsx`
4. Update analytics charts as needed

### Custom Analytics

Modify charts in `/components/dashboard/analytics-dashboard.tsx`:

```typescript
// Example: Add new chart type
<BarChart data={customData}>
  {/* Your custom visualization */}
</BarChart>
```

## License & Attribution

Auto-Dialer Pro is built with modern web technologies:
- Next.js 16 with React 19
- TailwindCSS for styling
- shadcn/ui components
- Google Sheets API
- Recharts for visualizations

---

**Last Updated:** 2026
**Version:** 1.0.0
