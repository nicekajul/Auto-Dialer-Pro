import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthClient } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId');

    if (!accessToken || !spreadsheetId) {
      return NextResponse.json(
        { error: 'Missing access token or spreadsheet ID' },
        { status: 400 }
      );
    }

    const auth = getAuthClient(accessToken);

    const sheets = google.sheets('v4');

    // Read header row
    const headerResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `'Lead mine 2026'!A1:Z1`,
    });

    const headers = headerResponse.data.values?.[0] || [];

    // Read first data row
    const dataResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `'Lead mine 2026'!A2:Z2`,
    });

    const firstRow = dataResponse.data.values?.[0] || [];

    // Create mapping
    const columnMapping = headers.map((header, index) => ({
      index,
      letter: String.fromCharCode(65 + index),
      header: header || '(empty)',
      sampleData: firstRow[index] || '(empty)',
    }));

    return NextResponse.json({
      totalColumns: headers.length,
      columns: columnMapping,
      recommendations: {
        firstName: columnMapping.find((c) => c.header.toLowerCase().includes('first name')),
        lastName: columnMapping.find((c) => c.header.toLowerCase().includes('last name')),
        phone: columnMapping.find((c) => c.header.toLowerCase().includes('phone')),
        status: columnMapping.find((c) => c.header.toLowerCase().includes('status')),
        notes: columnMapping.find((c) => c.header.toLowerCase().includes('note')),
        attempts: columnMapping.find((c) => c.header.toLowerCase().includes('attempt')),
      },
    });
  } catch (error: any) {
    console.error('[v0] Column verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify columns' },
      { status: 500 }
    );
  }
}
