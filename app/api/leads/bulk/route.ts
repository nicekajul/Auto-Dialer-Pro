import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    const { spreadsheetId, action, filters } = await request.json();

    if (!accessToken || !spreadsheetId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({ access_token: accessToken });

    // Create sheets API instance inside the function
    const sheets = google.sheets('v4');

    // Read all leads (full column range with your sheet structure)
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Lead mine 2026!A2:S1000',
    });

    const rows = response.data.values || [];
    const updates = [];

    // Process based on action
    // Column mappings: P=Status(16), Q=Notes(17), R=Attempts(18), S=LastAttempt(19)
    switch (action) {
      case 'retry-no-answer': {
        // Reset all "no-answer" leads to "pending"
        rows.forEach((row, index) => {
          if (row[16] === 'no-answer') {
            updates.push({
              range: `'Lead mine 2026'!P${index + 2}`,
              values: [['pending']],
            });
          }
        });
        break;
      }

      case 'flag-no-answer': {
        // Add flag to all "no-answer" leads
        rows.forEach((row, index) => {
          if (row[16] === 'no-answer') {
            updates.push({
              range: `'Lead mine 2026'!Q${index + 2}`,
              values: [[`${row[17] || ''}\n[FLAGGED FOR RETRY]`]],
            });
          }
        });
        break;
      }

      case 'mark-contacted': {
        // Mark all pending as contacted (no-answer)
        rows.forEach((row, index) => {
          if (row[16] === 'pending') {
            updates.push({
              range: `'Lead mine 2026'!P${index + 2}`,
              values: [['no-answer']],
            });
            updates.push({
              range: `'Lead mine 2026'!R${index + 2}`,
              values: [[parseInt(row[18] || '0', 10) + 1]],
            });
          }
        });
        break;
      }

      case 'clear-all': {
        // Reset all to pending
        rows.forEach((row, index) => {
          updates.push({
            range: `'Lead mine 2026'!P${index + 2}`,
            values: [['pending']],
          });
          updates.push({
            range: `'Lead mine 2026'!Q${index + 2}`,
            values: [['']],
          });
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Apply bulk updates
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        auth,
        spreadsheetId,
        requestBody: {
          data: updates,
          valueInputOption: 'RAW',
        },
      });
    }

    return NextResponse.json({
      success: true,
      updatesApplied: updates.length,
    });
  } catch (error) {
    console.error('Bulk action failed:', error);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
