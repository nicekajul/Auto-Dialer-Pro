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

  // Find First Name and Last Name columns (more reliable than Name column)
  const firstNameColIndex = findColumnIndex(['first name', 'firstname']) ?? 6;
  const lastNameColIndex = findColumnIndex(['last name', 'lastname']) ?? 7;
  const emailColIndex = findColumnIndex(['email', 'email address']) ?? 4;
  const statusColIndex = findColumnIndex(['status']) ?? 15;
  const notesColIndex = findColumnIndex(['notes', 'note']) ?? 16;
  const attemptsColIndex = findColumnIndex(['attempts', 'attempt']) ?? 17;
  const lastAttemptColIndex = findColumnIndex(['last attempt', 'last called']) ?? 18;
  const nameColIndex = findColumnIndex(['name']) ?? 5; // Declare nameColIndex here

  console.log('[v0] ===== COLUMN ALIGNMENT VERIFICATION =====');
  console.log('[v0] Expected columns: G=First Name, H=Last Name, E=Email, J-N=Phones, P=Status, Q=Notes, R=Attempts, S=Last Attempt');
  console.log('[v0] Detected indices:', {
    'First Name (should be 6)': firstNameColIndex,
    'Last Name (should be 7)': lastNameColIndex,
    'Email (should be 4)': emailColIndex,
    'Phone columns (should be 9,10,11,12,13)': phoneIndices,
    'Status (should be 15)': statusColIndex,
    'Notes (should be 16)': notesColIndex,
    'Attempts (should be 17)': attemptsColIndex,
    'Last Attempt (should be 18)': lastAttemptColIndex,
  });
  console.log('[v0] Column letters:', {
    Status: String.fromCharCode(65 + statusColIndex),
    Notes: String.fromCharCode(65 + notesColIndex),
    Attempts: String.fromCharCode(65 + attemptsColIndex),
    'Last Attempt': String.fromCharCode(65 + lastAttemptColIndex),
  });
  console.log('[v0] ==========================================');

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
      
      // Concatenate First Name + Last Name
      const firstName = (row[firstNameColIndex] || '').toString().trim();
      const lastName = (row[lastNameColIndex] || '').toString().trim();
      const leadName = `${firstName} ${lastName}`.trim();

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
    console.log('[v0] First lead sample:', {
      name: leads[0].name,
      phone: leads[0].phone,
      email: leads[0].email,
      status: leads[0].status,
      notes: leads[0].notes,
      attempts: leads[0].attempts,
      rowIndex: leads[0].rowIndex,
    });
    console.log('[v0] ===== VERIFY: Check if Status/Notes/Attempts will write to P/Q/R columns in your sheet =====');
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

  console.log('[v0] ===== UPDATE VERIFICATION =====');
  console.log('[v0] Expected: Status=P(15), Notes=Q(16), Attempts=R(17), Last Attempt=S(18)');
  console.log('[v0] Detected:', {
    'Status (should be P/15)': `${indexToLetter(statusColIndex)}(${statusColIndex})`,
    'Notes (should be Q/16)': `${indexToLetter(notesColIndex)}(${notesColIndex})`,
    'Attempts (should be R/17)': `${indexToLetter(attemptsColIndex)}(${attemptsColIndex})`,
    'Last Attempt (should be S/18)': `${indexToLetter(lastAttemptColIndex)}(${lastAttemptColIndex})`,
    'Row': rowIndex,
  });
  console.log('[v0] ===================================');

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
