import { NextRequest, NextResponse } from 'next/server';
import { readLeadsFromSheet, updateLeadStatus } from '@/lib/google-sheets';
import { refreshAccessToken } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    const refreshToken = request.cookies.get('google_refresh_token')?.value;
    const spreadsheetId = request.nextUrl.searchParams.get('spreadsheetId');

    if (!accessToken || !spreadsheetId) {
      return NextResponse.json(
        { error: 'Missing access token or spreadsheet ID' },
        { status: 401 }
      );
    }

    try {
      const leads = await readLeadsFromSheet(accessToken, spreadsheetId);
      return NextResponse.json(leads);
    } catch (error: any) {
      // If token is expired, try to refresh
      if (error.status === 401 && refreshToken) {
        const newTokens = await refreshAccessToken(refreshToken);
        const response = NextResponse.next();
        response.cookies.set('google_access_token', newTokens.access_token || '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        const leads = await readLeadsFromSheet(
          newTokens.access_token || '',
          spreadsheetId
        );
        return NextResponse.json(leads);
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('google_access_token')?.value;
    const { spreadsheetId, rowIndex, updates } = await request.json();

    if (!accessToken || !spreadsheetId) {
      return NextResponse.json(
        { error: 'Missing access token or spreadsheet ID' },
        { status: 401 }
      );
    }

    await updateLeadStatus(accessToken, spreadsheetId, rowIndex, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
