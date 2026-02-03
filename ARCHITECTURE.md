# Auto-Dialer Pro - Architecture Overview

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Login Page   │  │  Dashboard   │  │   RingCentral App   │  │
│  │   (OAuth)      │  │   (React)    │  │   (External)        │  │
│  └────────┬────────┘  └──────┬───────┘  └──────────┬──────────┘  │
│           │                  │                     │              │
│           └──────────────────┴─────────────────────┘              │
│                               │                                    │
│                    (HTTP/HTTPS Requests)                          │
│                               │                                    │
└───────────────────────────────┼────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Backend (Vercel)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              API Routes (Next.js)                        │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │    │
│  │  │ /api/auth/   │  │ /api/leads/  │  │ /api/leads/ │   │    │
│  │  │   login      │  │    route     │  │   bulk      │   │    │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬───────┘   │    │
│  │         │                 │                │           │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │    OAuth & Token Management                 │      │    │
│  │  │    - OAuth 2.0 Flow                        │      │    │
│  │  │    - Token Refresh                         │      │    │
│  │  │    - HTTP-Only Cookies                     │      │    │
│  │  └──────┬───────────────────────────────────────┘      │    │
│  │         │                                              │    │
│  └─────────┼──────────────────────────────────────────────┘    │
│            │                                                    │
│            ▼                                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         Google Sheets API Integration                  │  │
│  │  - Read Lead Data                                      │  │
│  │  - Write Call Outcomes                                │  │
│  │  - Update Attempt Counters                            │  │
│  │  - Sync Timestamps                                    │  │
│  └─────────────────┬──────────────────────────────────────┘  │
│                    │                                          │
└────────────────────┼──────────────────────────────────────────┘
                     │
                     ▼ (HTTPS)
         ┌──────────────────────┐
         │  Google OAuth 2.0    │
         │  & Sheets API        │
         └──────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   Google Sheets      │
         │   (Your Lead Data)   │
         └──────────────────────┘
\`\`\`

---

## Data Flow Diagram

### Call Management Flow

\`\`\`
┌────────────────┐
│  Load Leads    │
│  from Sheet    │
└────────┬───────┘
         │
         ▼
┌────────────────────┐
│  Display Queue     │
│  (Pending Leads)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Select Lead       │
│  & Show Details    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐     ┌──────────────────┐
│  Click-to-Dial URL │────▶│  RingCentral App │
│  Generated         │     │  Opens Dialer    │
└────────┬───────────┘     └──────────────────┘
         │                         │
         │                         ▼
         │                  ┌──────────────┐
         │                  │  Agent Talks │
         │                  │  to Contact  │
         │                  └──────┬───────┘
         │                         │
         │                         ▼
         │                  ┌──────────────────────┐
         │                  │  Select Outcome:     │
         │                  │  - Answered          │
         │                  │  - No Answer         │
         │                  │  - Voicemail         │
         │                  │  - Busy              │
         │                  └──────┬───────────────┘
         │                         │
         ▼                         ▼
    ┌──────────────────────────────────────┐
    │  Update in Database:                 │
    │  - Status = Outcome                  │
    │  - Notes = Agent Notes               │
    │  - Attempts += 1                     │
    │  - Last Attempt = Now                │
    │  - Agent = Current Agent Name        │
    └──────────┬───────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────┐
    │  Sync to Google Sheets               │
    │  via API                             │
    └──────────┬───────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────┐
    │  Next Lead Loads                     │
    │  (Auto or Manual)                    │
    └──────────────────────────────────────┘
\`\`\`

---

## Component Hierarchy

\`\`\`
App (page.tsx)
│
├─ Layout
│  └─ DashboardHeader
│
├─ SetupModal (if not configured)
│
└─ Dashboard Content (Tabbed)
   │
   ├─ Tab: Dialer
   │  ├─ AutoDialerUI
   │  │  ├─ Current Lead Info
   │  │  ├─ Click-to-Dial Button
   │  │  ├─ Call Duration Timer
   │  │  └─ Status Display
   │  │
   │  └─ CallPanel
   │     ├─ Outcome Buttons
   │     ├─ Notes Textarea
   │     └─ Quick Actions
   │
   ├─ Tab: Queue
   │  ├─ LeadQueue
   │  │  ├─ Pending Leads Section
   │  │  └─ Recently Contacted Section
   │  │
   │  └─ CallHistory
   │     └─ Recent Calls Display
   │
   ├─ Tab: Analytics
   │  └─ AnalyticsDashboard
   │     ├─ Metric Cards
   │     ├─ Pie Chart (Outcomes)
   │     └─ Bar Chart (Attempts)
   │
   └─ Tab: Actions
      └─ BulkActions
         ├─ Retry Leads
         ├─ Flag Leads
         ├─ Mark Contacted
         └─ Reset All
\`\`\`

---

## State Management Flow

\`\`\`
┌────────────────────────────────────────┐
│     Dashboard State (React)            │
├────────────────────────────────────────┤
│                                         │
│  spreadsheetId: string                 │
│  agentName: string                     │
│  isAutoDialing: boolean                │
│  currentLead: Lead | null              │
│  leads: Lead[]                         │
│                                         │
└────────────────────────────────────────┘
         │              │
         │              │
    ┌────▼────┐    ┌────▼────┐
    │ Polling │    │ Actions  │
    │ (5s)    │    │ (Manual) │
    └────┬────┘    └────┬────┘
         │              │
         └──────┬───────┘
                │
                ▼
    ┌────────────────────┐
    │  Update Lead Data  │
    │  from API          │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  Re-render UI      │
    │  with new state    │
    └────────────────────┘
\`\`\`

---

## API Endpoints Architecture

\`\`\`
┌────────────────────────────────────────────────────────┐
│              Next.js API Routes                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Authentication Endpoints                             │
│  ├─ GET  /api/auth/login                             │
│  └─ GET  /api/auth/google-callback?code=X&state=Y   │
│                                                         │
│  Lead Management Endpoints                            │
│  ├─ GET  /api/leads?spreadsheetId=X                  │
│  │        (Fetch all leads)                           │
│  │                                                     │
│  ├─ PUT  /api/leads                                  │
│  │        (Update single lead: status, notes, etc.)   │
│  │                                                     │
│  └─ POST /api/leads/bulk                             │
│           (Bulk operations: retry, flag, reset)       │
│                                                         │
└────────────────────────────────────────────────────────┘
        │              │                    │
        ▼              ▼                    ▼
   ┌─────────┐   ┌─────────┐          ┌──────────┐
   │ Google  │   │ Google  │          │ Google   │
   │ OAuth   │   │ Sheets  │          │ Sheets   │
   │ Tokens  │   │ Read    │          │ Write    │
   └─────────┘   └─────────┘          └──────────┘
\`\`\`

---

## Google Sheets Integration

\`\`\`
Your Google Sheet Structure:

┌──────┬────────┬────────┬─────────┬──────────┬──────────┬──────────┐
│  A   │   B    │   C    │    D    │    E     │    F     │    G     │
├──────┼────────┼────────┼─────────┼──────────┼──────────┼──────────┤
│Name  │ Phone  │ Email  │ Status  │  Notes   │Attempts  │ LastCall │
├──────┼────────┼────────┼─────────┼──────────┼──────────┼──────────┤
│John  │+1-555- │john@   │pending  │          │ 0        │          │
│Smith │123-4567│example │         │          │          │          │
├──────┼────────┼────────┼─────────┼──────────┼──────────┼──────────┤
│Jane  │+1-555- │jane@   │answered │Demo call │ 1        │2026-02-04│
│Doe   │987-6543│example │         │successful│          │14:30:00Z │
└──────┴────────┴────────┴─────────┴──────────┴──────────┴──────────┘

Read Flow:
┌─────────────────────────────────────────────────────┐
│ 1. App requests: GET /api/leads?spreadsheetId=ABC  │
│ 2. Server gets access token from cookie             │
│ 3. Server calls Google Sheets API                   │
│ 4. API returns rows 2-1000 as JSON                  │
│ 5. App displays leads in UI                         │
└─────────────────────────────────────────────────────┘

Write Flow:
┌─────────────────────────────────────────────────────┐
│ 1. Agent clicks outcome button                      │
│ 2. App sends: PUT /api/leads with update data       │
│ 3. Server updates specific row in sheet             │
│ 4. Google Sheets updated immediately               │
│ 5. Next refresh shows updated data                  │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## Authentication Flow (OAuth 2.0)

\`\`\`
┌──────────────┐
│ User Browser │
└──────┬───────┘
       │ 1. Click "Sign in with Google"
       │
       ▼
┌────────────────────┐
│  /api/auth/login   │
│  (redirects to)    │
└────────┬───────────┘
         │
         ▼ 2. Redirect to Google Auth
    ┌─────────────────┐
    │ accounts.google │
    │ .com/oauth2     │
    └────────┬────────┘
             │
             │ 3. User approves access
             │
             ▼
    ┌────────────────────────┐
    │ Google redirects with  │
    │ authorization code     │
    └────────┬───────────────┘
             │ 4. Code sent to
             │
             ▼
    ┌────────────────────────────┐
    │ /api/auth/google-callback  │
    └────────┬───────────────────┘
             │ 5. Server exchanges code
             │    for access token
             │
             ▼ 6. Store in HTTP-only cookie
    ┌────────────────────┐
    │ Set-Cookie header  │
    └────────┬───────────┘
             │
             ▼ 7. Redirect to /dashboard
    ┌────────────────────┐
    │ Dashboard loaded   │
    │ with token in      │
    │ cookie (secure)    │
    └────────────────────┘

Session:
┌─────────────────────────────────────────┐
│ Browser Cookie (HTTP-Only, Secure)      │
│ ├─ google_access_token (expires in 1hr) │
│ └─ google_refresh_token (long-lived)    │
├─────────────────────────────────────────┤
│ Auto-Refresh Flow:                      │
│ When access_token expires:              │
│ 1. Server detects 401 error             │
│ 2. Uses refresh_token to get new token  │
│ 3. Updates cookie with new token        │
│ 4. Retries original request             │
│ 5. User doesn't notice interruption     │
└─────────────────────────────────────────┘
\`\`\`

---

## Real-Time Sync Mechanism

\`\`\`
Dashboard mounted
│
├─ Poll every 5 seconds ┐
│                       │
│                       ▼
│              ┌───────────────────┐
│              │ GET /api/leads    │
│              └─────────┬─────────┘
│                        │
│                        ▼
│              ┌───────────────────┐
│              │ Get current state │
│              │ from Google Sheet │
│              └─────────┬─────────┘
│                        │
│                        ▼
│              ┌───────────────────┐
│              │ Compare with      │
│              │ current state     │
│              └─────────┬─────────┘
│                        │
│                        ▼
│              ┌───────────────────┐
│              │ If different:     │
│              │ Update state      │
│              │ & re-render       │
│              └───────────────────┘
│
└─ Manual Actions (Outcome, Bulk Ops)
   │
   ▼
┌───────────────────────┐
│ Immediate write to    │
│ Google Sheets via API │
└───────────┬───────────┘
            │
            ▼
    ┌───────────────────┐
    │ Next poll         │
    │ reflects changes  │
    └───────────────────┘
\`\`\`

---

## Error Handling Architecture

\`\`\`
┌─────────────────────────────────┐
│ Application Layer Error         │
├─────────────────────────────────┤
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Authentication Errors        │ │
│ │ - Invalid OAuth code         │ │
│ │ - Token expired (auto-retry) │ │
│ │ - Permission denied          │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ API Errors                   │ │
│ │ - Spreadsheet not found      │ │
│ │ - Rate limit exceeded        │ │
│ │ - Network timeout            │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ User Errors                  │ │
│ │ - Invalid lead data          │ │
│ │ - Missing required fields    │ │
│ │ - Sheet access issues        │ │
│ └──────────────────────────────┘ │
│                                  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Error Handling                  │
├─────────────────────────────────┤
│                                  │
│ Try/Catch Blocks                │
│ ↓ Console Error Logging         │
│ ↓ Toast Notification to User    │
│ ↓ Graceful Degradation          │
│ ↓ Retry Logic (for transient)   │
│ ↓ Detailed User Messages        │
│                                  │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ User Sees:                      │
│ - Clear error message           │
│ - Action to take                │
│ - App continues working         │
└─────────────────────────────────┘
\`\`\`

---

## Performance Architecture

\`\`\`
Load Time Optimization:
├─ Next.js Static Optimization
│  ├─ Automatic code splitting
│  └─ Route prefetching
│
├─ Browser Caching
│  ├─ Service workers
│  └─ Local storage for state
│
└─ API Optimization
   ├─ Batch requests where possible
   ├─ Efficient JSON payloads
   └─ 5-second polling (balanced)

Runtime Performance:
├─ React Hooks
│  ├─ useState for state
│  ├─ useCallback for memoization
│  └─ useEffect for side effects
│
├─ Component Optimization
│  ├─ Lazy loading analytics
│  └─ Virtual scrolling for large lists
│
└─ Network Optimization
   ├─ Reduced payload size
   ├─ Compression (gzip)
   └─ Connection pooling ready
\`\`\`

---

## Deployment Architecture

\`\`\`
Local Development
├─ npm run dev
├─ Hot module reloading
└─ Local database (if added)

Staging (Preview)
├─ Vercel Preview Deployments
├─ Auto-deployed on PR
└─ Full feature testing

Production
├─ Vercel Deployment
├─ Edge Network CDN
├─ Auto-scaling
└─ 99.9% uptime SLA

Monitoring
├─ Error tracking (future: Sentry)
├─ Performance monitoring
├─ Analytics (future: custom dashboard)
└─ Access logs
\`\`\`

---

## Scalability Considerations

\`\`\`
Current Architecture:
├─ Single database source (Google Sheets)
├─ Stateless API servers
├─ Client-side caching
└─ Polling for updates (5s interval)

Scaling Opportunities:
├─ Add database layer (PostgreSQL)
├─ Implement WebSocket for real-time
├─ Add message queues (Bull/RabbitMQ)
├─ Distribute workload across servers
└─ Add caching layer (Redis)

Bottlenecks to Watch:
├─ Google Sheets API rate limits (500 req/min)
├─ Large lead lists (>1000 records slow)
├─ Concurrent users (max ~50-100 comfortably)
└─ Call recording storage (if added later)

Optimization Strategies:
├─ Increase polling interval (10-30s)
├─ Implement incremental sync
├─ Add pagination for large lists
├─ Cache lead data locally
└─ Batch bulk operations
\`\`\`

---

**This architecture is designed to be:**
- ✅ Simple and maintainable
- ✅ Secure with OAuth 2.0
- ✅ Scalable with stateless design
- ✅ Performant with optimizations
- ✅ Reliable with error handling

For questions about specific components, refer to the relevant source files or documentation.

---

*Version: 1.0.0 | February 2026*
