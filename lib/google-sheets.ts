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
  sheetName: string = 'Lead mine 2026'
): Promise<Lead[]> => {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  // Read all columns from A to S (your full sheet structure)
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `${sheetName}!A2:S1000`,
  });

  const rows = response.data.values || [];
  const leads: Lead[] = rows
    .map((row, index) => {
      // Extract primary phone (first available from PHONE 1-5)
      const phones = [
        row[9],  // PHONE 1 (column J)
        row[10], // PHONE 2 (column K)
        row[11], // PHONE 3 (column L)
        row[12], // PHONE 4 (column M)
        row[13], // PHONE 5 (column N)
      ].filter((p) => p && p.trim().length > 0);

      const primaryPhone = phones[0] || '';

      return {
        id: `lead-${index}`,
        name: row[5] || '', // Name (column F)
        phone: primaryPhone,
        email: row[4] || '', // Email Address (column E)
        status: (row[16] || 'pending') as Lead['status'], // Status (column P)
        notes: row[17] || '', // Notes (column Q)
        attempts: parseInt(row[18] || '0', 10), // Attempts (column R)
        lastAttempt: row[19] || '', // Last Attempt (column S)
        rowIndex: index + 2, // Account for header row
      };
    })
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
  sheetName: string = 'Lead mine 2026'
) => {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  const updateData = [];

  // Map updates to correct columns based on your sheet structure
  if (updates.status !== undefined) {
    updateData.push({
      range: `${sheetName}!P${rowIndex}`, // Status column
      values: [[updates.status]],
    });
  }

  if (updates.notes !== undefined) {
    updateData.push({
      range: `${sheetName}!Q${rowIndex}`, // Notes column
      values: [[updates.notes]],
    });
  }

  if (updates.attempts !== undefined) {
    updateData.push({
      range: `${sheetName}!R${rowIndex}`, // Attempts column
      values: [[updates.attempts]],
    });
  }

  if (updates.lastAttempt !== undefined) {
    updateData.push({
      range: `${sheetName}!S${rowIndex}`, // Last Attempt column
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
