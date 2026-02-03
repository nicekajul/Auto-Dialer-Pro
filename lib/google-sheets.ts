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

  // Read ALL rows including header (A1:S1000)
  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `${sheetName}!A1:S1000`,
  });

  const allRows = response.data.values || [];
  console.log('[v0] Total rows fetched:', allRows.length);
  
  if (allRows.length === 0) {
    console.log('[v0] No data found in sheet');
    return [];
  }

  // First row is headers
  const headers = allRows[0] || [];
  console.log('[v0] Headers:', headers);

  // Find column indices dynamically by looking for header names
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

  // Find all phone columns
  const phoneIndices: number[] = [];
  for (let i = 0; i < headers.length; i++) {
    const header = (headers[i] || '').toString().toLowerCase();
    if (header.includes('phone')) {
      phoneIndices.push(i);
    }
  }

  // Fallback defaults if headers not found
  const nameColIndex = findColumnIndex(['name', 'contact name']) ?? 5;
  const emailColIndex = findColumnIndex(['email', 'email address']) ?? 4;
  const statusColIndex = findColumnIndex(['status']) ?? 15;
  const notesColIndex = findColumnIndex(['notes', 'note']) ?? 16;
  const attemptsColIndex = findColumnIndex(['attempts', 'attempt']) ?? 17;
  const lastAttemptColIndex = findColumnIndex(['last attempt', 'last called']) ?? 18;

  console.log('[v0] Column mapping:', {
    name: nameColIndex,
    email: emailColIndex,
    phones: phoneIndices,
    status: statusColIndex,
    notes: notesColIndex,
    attempts: attemptsColIndex,
    lastAttempt: lastAttemptColIndex,
  });

  // Data rows start from index 1 (skip header at index 0)
  const dataRows = allRows.slice(1);
  
  const leads: Lead[] = dataRows
    .map((row, dataIndex) => {
      // Extract phones from identified phone columns
      const phones = phoneIndices
        .map((idx) => {
          const val = row[idx];
          return val ? val.toString().trim() : '';
        })
        .filter((p) => p.length > 0);

      const primaryPhone = phones[0] || '';
      const leadName = (row[nameColIndex] || '').toString().trim();

      // Debug Amanda Wilson
      if (leadName.includes('Amanda')) {
        console.log('[v0] Amanda Wilson found:', {
          name: leadName,
          email: row[emailColIndex],
          phones: phones,
          selectedPhone: primaryPhone,
          rowIndex: dataIndex + 2, // +2 because header is row 1, data starts at row 2
          columnIndex: nameColIndex,
        });
      }

      return {
        id: `lead-${dataIndex}`,
        name: leadName,
        phone: primaryPhone,
        email: (row[emailColIndex] || '').toString().trim(),
        status: ((row[statusColIndex] || 'pending').toString() as any) as Lead['status'],
        notes: (row[notesColIndex] || '').toString().trim(),
        attempts: parseInt((row[attemptsColIndex] || '0').toString(), 10),
        lastAttempt: (row[lastAttemptColIndex] || '').toString().trim(),
        rowIndex: dataIndex + 2, // Google Sheets row number (1-indexed, +1 for header)
      };
    })
    .filter((lead) => lead.phone.trim().length > 0 && lead.name.trim().length > 0);

  console.log('[v0] Final leads count:', leads.length);
  if (leads.length > 0) {
    console.log('[v0] First lead:', leads[0]);
  }
  
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

  // Fetch headers to find correct column letters
  const headerResponse = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `${sheetName}!A1:S1`,
  });

  const headers = headerResponse.data.values?.[0] || [];

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

  // Find column indices
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

  const statusColIndex = findColumnIndex(['status']) ?? 15;
  const notesColIndex = findColumnIndex(['notes', 'note']) ?? 16;
  const attemptsColIndex = findColumnIndex(['attempts', 'attempt']) ?? 17;
  const lastAttemptColIndex = findColumnIndex(['last attempt', 'last called']) ?? 18;

  console.log('[v0] Update column mapping:', {
    statusCol: indexToLetter(statusColIndex),
    notesCol: indexToLetter(notesColIndex),
    attemptsCol: indexToLetter(attemptsColIndex),
    lastAttemptCol: indexToLetter(lastAttemptColIndex),
    rowIndex: rowIndex,
  });

  const updateData = [];

  if (updates.status !== undefined) {
    updateData.push({
      range: `${sheetName}!${indexToLetter(statusColIndex)}${rowIndex}`,
      values: [[updates.status]],
    });
  }

  if (updates.notes !== undefined) {
    updateData.push({
      range: `${sheetName}!${indexToLetter(notesColIndex)}${rowIndex}`,
      values: [[updates.notes]],
    });
  }

  if (updates.attempts !== undefined) {
    updateData.push({
      range: `${sheetName}!${indexToLetter(attemptsColIndex)}${rowIndex}`,
      values: [[updates.attempts]],
    });
  }

  if (updates.lastAttempt !== undefined) {
    updateData.push({
      range: `${sheetName}!${indexToLetter(lastAttemptColIndex)}${rowIndex}`,
      values: [[updates.lastAttempt]],
    });
  }

  if (updateData.length === 0) return;

  console.log('[v0] Updating with data:', updateData);

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
