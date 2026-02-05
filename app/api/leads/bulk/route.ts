import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthClient } from '@/lib/google-sheets';

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

    const auth = getAuthClient(accessToken);

    // Create sheets API instance inside the function
    const sheets = google.sheets('v4');

    // Read headers first to find correct columns
    const headerResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `'Lead mine 2026'!A1:S1`,
    });

    const headers = headerResponse.data.values?.[0] || [];

    // Helper to find column index
    const findColumnIndex = (searchTerms: string[]) => {
      for (let i = 0; i < headers.length; i++) {
        const header = (headers[i] || '').toString().toLowerCase();
        for (const term of searchTerms) {
          if (header.includes(term.toLowerCase())) {
            return i;
          }
        }
      }
      return null;
    };

    // Find column indices
    const statusColIndex = findColumnIndex(['status']) ?? 15;
    const notesColIndex = findColumnIndex(['notes', 'note']) ?? 16;
    const attemptsColIndex = findColumnIndex(['attempts', 'attempt']) ?? 17;

    // Helper to convert column index to letter
    const indexToLetter = (index: number) => {
      let letter = '';
      let num = index + 1; // 0-based to 1-based
      while (num > 0) {
        num--;
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26);
      }
      return letter;
    };

    const statusCol = indexToLetter(statusColIndex);
    const notesCol = indexToLetter(notesColIndex);
    const attemptsCol = indexToLetter(attemptsColIndex);

    console.log('[v0] Bulk API column mapping:', {
      statusCol,
      notesCol,
      attemptsCol,
      statusIndex: statusColIndex,
      notesIndex: notesColIndex,
      attemptsIndex: attemptsColIndex,
    });

    // Now read all data rows (A2 onwards, skipping header)
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Lead mine 2026!A2:S1000',
    });

    const rows = response.data.values || [];
    const updates: any[] = [];

    // Process based on action
    // Column mappings: P=Status(16), Q=Notes(17), R=Attempts(18), S=LastAttempt(19)
    switch (action) {
      case 'retry-no-answer': {
        // Reset all "no-answer" leads to "pending"
        rows.forEach((row, index) => {
          if (row[statusColIndex] === 'no-answer') {
            updates.push({
              range: `'Lead mine 2026'!${statusCol}${index + 2}`,
              values: [['pending']],
            });
          }
        });
        break;
      }

      case 'flag-no-answer': {
        // Add flag to all "no-answer" leads
        rows.forEach((row, index) => {
          if (row[statusColIndex] === 'no-answer') {
            updates.push({
              range: `'Lead mine 2026'!${notesCol}${index + 2}`,
              values: [[`${row[notesColIndex] || ''}\n[FLAGGED FOR RETRY]`]],
            });
          }
        });
        break;
      }

      case 'mark-contacted': {
        // Mark all pending as contacted (no-answer)
        rows.forEach((row, index) => {
          if (row[statusColIndex] === 'pending') {
            updates.push({
              range: `'Lead mine 2026'!${statusCol}${index + 2}`,
              values: [['no-answer']],
            });
            updates.push({
              range: `'Lead mine 2026'!${attemptsCol}${index + 2}`,
              values: [[parseInt(row[attemptsColIndex] || '0', 10) + 1]],
            });
          }
        });
        break;
      }

      case 'clear-all': {
        // Reset all to pending
        rows.forEach((row, index) => {
          updates.push({
            range: `'Lead mine 2026'!${statusCol}${index + 2}`,
            values: [['pending']],
          });
          updates.push({
            range: `'Lead mine 2026'!${notesCol}${index + 2}`,
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
