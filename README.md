# Auto-Dialer Pro

A powerful web-based auto-dialer application for sales teams. Automate lead calling, track call outcomes in real-time, and manage your sales pipeline through seamless Google Sheets integration.

## 🎯 Key Features

### 🔄 Automatic Lead Dialing
- Sequential automatic dialing from your lead list
- No manual clicking required
- Pause on connection for agent to speak
- Auto-resume on call completion

### 📞 Click-to-Dial Integration
- Direct RingCentral integration via click-to-dial URLs
- Opens dialer in RingCentral app or browser extension
- Formatted phone numbers for better UX
- Fallback to standard tel: protocol

### 📊 Google Sheets Integration
- Real-time sync with your Google Sheets
- Secure OAuth authentication
- Read/write call outcomes automatically
- No data stored on our servers

### 👥 Multi-Agent Support
- Multiple concurrent users working simultaneously
- Real-time lead queue management
- Agent attribution in call logs
- Shared analytics dashboard

### 📈 Call Tracking & Analytics
- Track call outcomes: Answered, No Answer, Voicemail, Busy
- Call duration tracking
- Attempt counting
- Performance metrics dashboard
- Real-time charts and statistics

### 🎛️ Bulk Actions
- Retry all "no-answer" leads
- Flag leads for follow-up
- Bulk status updates
- Reset and reorganize your queue

### 📝 Agent Notes
- Add contextual notes during/after calls
- Notes sync automatically to Google Sheets
- View note history for each lead

## 🚀 Quick Start

### Prerequisites
- Google Account with Google Sheets access
- RingCentral account (for click-to-dial functionality)
- Modern web browser

### Setup (5 minutes)

1. **Get Started**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Google OAuth**
   - See `SETUP_GUIDE.md` for detailed instructions

3. **Add Environment Variables**
   \`\`\`
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback
   \`\`\`

4. **Run Locally**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Deploy to Vercel**
   \`\`\`bash
   vercel deploy
   \`\`\`

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Comprehensive setup and configuration guide
- **[Google Sheets Template](#google-sheets-template)** - Required sheet structure

## 📋 Google Sheets Template

Create a sheet with these columns:

| Column | Name | Type | Required |
|--------|------|------|----------|
| A | Name | Text | Yes |
| B | Phone | Text (Phone Format) | Yes |
| C | Email | Text (Email) | No |
| D | Status | Text (pending/answered/no-answer/voicemail/busy) | No |
| E | Notes | Long Text | No |
| F | Attempts | Number | No |
| G | Last Attempt | DateTime | No |

### Example Data
\`\`\`
Name          | Phone          | Email                | Status     | Notes | Attempts | Last Attempt
John Smith    | +1-555-123-4567| john@example.com     | pending    |       | 0        |
Jane Doe      | +1-555-987-6543| jane@example.com     | answered   | Demo call | 1 | 2026-02-04T14:30:00Z
\`\`\`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, Next.js 16, TailwindCSS
- **UI Components**: shadcn/ui
- **Visualizations**: Recharts
- **API Integration**: Google Sheets API
- **Hosting**: Vercel
- **Authentication**: Google OAuth 2.0

### Data Flow
\`\`\`
Browser (UI)
    ↓
Next.js API Routes
    ↓
Google OAuth (Authentication)
    ↓
Google Sheets API
    ↓
Your Google Sheet
\`\`\`

### Key Components

\`\`\`
/app
  ├── page.tsx              # Login page
  ├── dashboard/
  │   ├── page.tsx          # Main dashboard
  │   └── loading.tsx       # Suspense boundary
  └── api/
      ├── auth/
      │   ├── login/        # OAuth flow start
      │   └── google-callback/ # OAuth callback
      ├── leads/
      │   ├── route.ts      # Lead CRUD operations
      │   └── bulk/route.ts # Bulk actions
      
/components/dashboard
  ├── dashboard-header.tsx  # Header with logout
  ├── setup-modal.tsx       # Initial setup
  ├── auto-dialer-ui.tsx    # Main dialer interface
  ├── call-panel.tsx        # Call outcome tracking
  ├── lead-queue.tsx        # Lead queue display
  ├── call-history.tsx      # Recent calls
  ├── analytics-dashboard.tsx # Charts & metrics
  └── bulk-actions.tsx      # Bulk operations

/lib
  ├── google-auth.ts        # OAuth utilities
  ├── google-sheets.ts      # Sheets API wrapper
  ├── ringcentral-dial.ts   # Click-to-dial URLs
  └── call-manager.ts       # Call state management
\`\`\`

## 🔐 Security

### Data Protection
- **OAuth Authentication**: Secure Google account verification
- **HTTP-Only Cookies**: Tokens stored securely (inaccessible to JavaScript)
- **No Server Storage**: All data stays in your Google Sheets
- **SSL/TLS**: Encrypted communication (Vercel default)
- **CORS Protected**: API routes validate origins

### Google Sheets Permissions
- Application accesses only what you authorize
- Can revoke access anytime from Google Account
- Per-sheet granularity via Google's sharing system

### Best Practices
- Use strong passwords on Google accounts
- Enable 2FA on Google accounts
- Regularly audit sheet sharing permissions
- Back up important data

## 📊 Analytics Dashboard

Track your team's performance:

### Key Metrics
- **Total Leads**: Complete count of contacts
- **Contacted**: Successfully answered calls
- **No Answer**: Unanswered attempts
- **Contact Rate**: Percentage of successful connections
- **Pending**: Remaining leads to contact

### Visualizations
- **Pie Chart**: Call outcome distribution
- **Bar Chart**: Attempt frequency distribution
- **Performance Trends**: Over time tracking

## 🎮 Usage Guide

### Making Your First Call

1. **Sign In** → Connect your Google account
2. **Enter Spreadsheet ID** → Found in your Sheet URL
3. **Click-to-Dial** → Opens RingCentral dialer
4. **Have Conversation** → Talk to your lead
5. **Log Outcome** → Select call result and add notes
6. **Auto-Next** → Move to next lead automatically

### Multi-Agent Setup

1. Share Google Sheet with team members
2. Each person signs in with their own Google account
3. Each enters their name for attribution
4. All agents see real-time lead updates
5. Manager can view team analytics

### Bulk Operations

**Retry No-Answer Leads**
- Resets "no-answer" status to "pending"
- Useful for end-of-day recovery attempts

**Flag for Follow-up**
- Adds flag to "no-answer" leads
- Creates follow-up queue for next day

**Mark All as Contacted**
- Bulk status update to "no-answer"
- Increments attempt counters
- Useful for campaign completion

**Reset All**
- Clears all data and resets to pending
- Use carefully - cannot be undone!

## 🛠️ Configuration

### Environment Variables

\`\`\`bash
# Required for Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-callback
\`\`\`

### Optional Customizations

- Modify phone number formatting in `/lib/ringcentral-dial.ts`
- Add new call outcomes in components
- Customize chart colors in analytics
- Adjust sync frequency in dashboard page

## 🐛 Troubleshooting

### OAuth Issues
- **"Invalid redirect URI"**: Check your environment variables match Google Console settings
- **"Access denied"**: Ensure Google Sheet OAuth scopes include Sheets API
- **"Token expired"**: App auto-refreshes; if stuck, sign out and back in

### Sync Issues
- **"Cannot access spreadsheet"**: Verify spreadsheet ID (not sheet name)
- **"Data not updating"**: Check network connection; manual refresh available
- **"Previous data cleared"**: Verify you didn't click "Reset All"

### Click-to-Dial Issues
- **URL not opening**: Install RingCentral Desktop or Browser Extension
- **Fallback to tel**: Browser doesn't support custom schemes
- **Number formatting**: Adjust in `/lib/ringcentral-dial.ts` for your region

### Performance Issues
- **Slow loading**: Reduce leads in sheet (>1000 may be slow)
- **Sync lag**: Normal 5-second refresh cycle; can adjust if needed
- **High bandwidth**: Real-time data sync uses minimal bandwidth

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

This is a v0-generated application. To contribute:

1. Test thoroughly before deploying to production
2. Back up your Google Sheets regularly
3. Review security implications of customizations
4. Update this README with any configuration changes

## 📄 License

This application integrates with:
- Google Sheets API (Google Terms)
- RingCentral click-to-dial (RingCentral Terms)
- Vercel deployment (Vercel Terms)

Ensure compliance with all third-party terms of service.

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org)
- [Google Sheets API Guide](https://developers.google.com/sheets/api)
- [RingCentral Developer Docs](https://developers.ringcentral.com)
- [TailwindCSS Reference](https://tailwindcss.com)

## ⚠️ Important Notes

1. **Data Backup**: Auto-Dialer stores nothing - all data lives in your Google Sheet. Back up regularly.

2. **Real-Time Sync**: Dashboard syncs every 5 seconds. Changes by other agents appear in near real-time.

3. **Call Deduplication**: Manual - no built-in system prevents multiple agents calling the same lead. Organize leads manually or use status filters.

4. **Compliance**: Ensure compliance with telemarketing laws in your jurisdiction (e.g., TCPA in US).

5. **Testing**: Test thoroughly with a small lead list before full deployment.

## 🚀 Deployment Checklist

- [ ] Set up Google Cloud project and OAuth
- [ ] Create Google Sheet with proper columns
- [ ] Add environment variables to Vercel
- [ ] Deploy to Vercel
- [ ] Test full workflow with sample leads
- [ ] Configure RingCentral integration
- [ ] Brief team on usage
- [ ] Monitor for issues in first week
- [ ] Set up regular backups of Google Sheets

## 📞 Support

For issues or questions:

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review browser console for errors (F12)
3. Verify environment variables are set correctly
4. Test with fresh Google Sheet if data corruption suspected

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Built with**: Next.js 16, React 19, TailwindCSS, Google Sheets API
