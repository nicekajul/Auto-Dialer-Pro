import { google } from 'googleapis';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'pending' | 'calling' | 'answered' | 'no-answer' | 'voicemail' | 'busy';
  notes: string;
  attempts: number;
  lastAttempt?: string;
  rowIndex: number;
}

const sheets = google.sheets('v4');

export const readLeadsFromSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string = 'Leads'
): Promise<Lead[]> => {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `${sheetName}!A2:F1000`,
  });

  const rows = response.data.values || [];
  const leads: Lead[] = rows
    .map((row, index) => ({
      id: `lead-${index}`,
      name: row[0] || '',
      phone: row[1] || '',
      email: row[2] || '',
      status: (row[3] || 'pending') as Lead['status'],
      notes: row[4] || '',
      attempts: parseInt(row[5] || '0', 10),
      rowIndex: index + 2, // Account for header row
    }))
    .filter((lead) => lead.phone.trim().length > 0);

  return leads;
};

export const updateLeadStatus = async (
  accessToken: string,
  spreadsheetId: string,
  rowIndex: number,
  updates: {
    status?: string;
    notes?: string;
    attempts?: number;
    lastAttempt?: string;
  },
  sheetName: string = 'Leads'
) => {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  const updateData = [];

  if (updates.status !== undefined) {
    updateData.push({
      range: `${sheetName}!D${rowIndex}`,
      values: [[updates.status]],
    });
  }

  if (updates.notes !== undefined) {
    updateData.push({
      range: `${sheetName}!E${rowIndex}`,
      values: [[updates.notes]],
    });
  }

  if (updates.attempts !== undefined) {
    updateData.push({
      range: `${sheetName}!F${rowIndex}`,
      values: [[updates.attempts]],
    });
  }

  if (updates.lastAttempt !== undefined) {
    updateData.push({
      range: `${sheetName}!G${rowIndex}`,
      values: [[updates.lastAttempt]],
    });
  }

  if (updateData.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    auth,
    spreadsheetId,
    requestBody: {
      data: updateData,
      valueInputOption: 'RAW',
    },
  });
};

export const getSpreadsheetMetadata = async (
  accessToken: string,
  spreadsheetId: string
) => {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  const response = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  return response.data;
};
