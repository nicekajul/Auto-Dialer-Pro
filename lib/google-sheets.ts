import { google } from 'googleapis';

export interface PhoneAttempt {
  phone: string;
  outcome: string | null;
  timestamp?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  phones?: string[]; // All available phone numbers
  currentPhoneIndex?: number; // Track which phone number we're on
  phoneAttempts?: PhoneAttempt[];
  email: string;
  status: 'pending' | 'calling' | 'answered' | 'no-answer' | 'voicemail' | 'busy' | 'disconnected' | 'not-in-service' | 'verified';
  notes: string;
  attempts: number;
  lastAttempt?: string;
  rowIndex: number;
}

const sheets = google.sheets('v4');

// Helper function to parse phone attempts from notes
function parsePhoneAttempts(notes: string): PhoneAttempt[] {
  if (!notes) return [];

  const phoneAttempts: PhoneAttempt[] = [];

  // Look for [Phone Attempts] section
  const match = notes.match(/\[Phone Attempts\]([\s\S]*?)(?:\n\n|\[|$)/);
  if (!match) return [];

  const attemptsSection = match[1].trim();
  const lines = attemptsSection.split('\n');

  lines.forEach((line) => {
    // Parse format: "(404) 419-2659: Not in Service (2/5/2026, 3:36:13 AM)"
    // or: "phone: outcome (timestamp)"
    const phoneMatch = line.match(/^(.+?):\s*(.+?)\s*\((.+?)\)\s*$/);
    if (phoneMatch) {
      const phone = phoneMatch[1].trim();
      const outcome = phoneMatch[2].trim().toLowerCase().replace(/\s+/g, '-');
      const timestamp = phoneMatch[3].trim();

      phoneAttempts.push({
        phone,
        outcome,
        timestamp,
      });
    }
  });

  return phoneAttempts;
}

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

      const email = (row[emailColIndex] || '').toString().trim();
      const status = (row[statusColIndex] || 'pending').toString();
      const notes = (row[notesColIndex] || '').toString().trim();
      const attempts = parseInt((row[attemptsColIndex] || '0').toString(), 10);
      const lastAttempt = (row[lastAttemptColIndex] || '').toString().trim();

      // Parse phone attempts from notes
      const phoneAttempts = parsePhoneAttempts(notes);

      return {
        id: `lead-${dataIndex}`,
        rowIndex: dataIndex + 2,
        name: leadName,
        phone: primaryPhone,
        phones: phones,
        currentPhoneIndex: 0,
        phoneAttempts,
        email,
        status: (status as any) as Lead['status'],
        notes,
        attempts,
        lastAttempt: lastAttempt || undefined,
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

// Helper to get or create the Archive sheet
const getOrCreateArchiveSheet = async (
  auth: any,
  spreadsheetId: string,
  archiveSheetName: string = 'Archived Leads'
) => {
  const metadata = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const sheet = metadata.data.sheets?.find(
    (s) => s.properties?.title === archiveSheetName
  );

  if (!sheet) {
    // Create the sheet
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: archiveSheetName,
              },
            },
          },
        ],
      },
    });

    // Copy headers from main sheet (assuming row 1 is headers)
    const mainSheetName = 'Lead mine 2026'; // Should ideally be passed in or dynamic
    const headerResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${mainSheetName}!A1:Z1`,
    });

    if (headerResponse.data.values && headerResponse.data.values.length > 0) {
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: `${archiveSheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: headerResponse.data.values,
        },
      });
    }
  }

  return archiveSheetName;
};

// Archive a lead by moving it to the Archive sheet and clearing it from the main sheet
const archiveLead = async (
  auth: any,
  spreadsheetId: string,
  rowIndex: number,
  mainSheetName: string,
  updates: any
) => {
  const archiveSheetName = await getOrCreateArchiveSheet(auth, spreadsheetId);

  // 1. Read the full row data
  const rowResponse = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `${mainSheetName}!A${rowIndex}:Z${rowIndex}`,
  });

  const rowData = rowResponse.data.values?.[0];
  if (!rowData) {
    console.error('[v0] Failed to read row data for archiving');
    return;
  }

  // 2. Prepare the row for archive (apply the updates first!)
  // We need to know column indices to apply updates to the in-memory row data before archiving
  // For simplicity, we'll append the updates to the end if we can't map them, 
  // OR strictly relying on the standard columns?
  // Proper way: We have the headers code in updateLeadStatus.
  // We should probably just overwrite the row in the archive with the *current* row data
  // plus the applied updates.

  // Re-fetch headers to map updates to indices
  const headerResponse = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `${mainSheetName}!A1:Z1`,
  });
  const headers = headerResponse.data.values?.[0] || [];

  // Helper to find index
  const findIdx = (terms: string[]) => {
    for (let i = 0; i < headers.length; i++) {
      if (terms.some(t => headers[i].toLowerCase().includes(t))) return i;
    }
    return -1;
  };

  const statusIdx = findIdx(['status']);
  const notesIdx = findIdx(['notes', 'note']);
  const attemptsIdx = findIdx(['attempts', 'attempt']);
  const lastAttemptIdx = findIdx(['last attempt', 'last called']);

  // Apply updates to the row data array
  // Extend rowData if it's shorter than the index
  const maxIdx = Math.max(statusIdx, notesIdx, attemptsIdx, lastAttemptIdx);
  while (rowData.length <= maxIdx) rowData.push('');

  if (updates.status && statusIdx !== -1) rowData[statusIdx] = updates.status;
  if (updates.notes && notesIdx !== -1) rowData[notesIdx] = updates.notes;
  if (updates.attempts !== undefined && attemptsIdx !== -1) rowData[attemptsIdx] = updates.attempts.toString();
  if (updates.lastAttempt && lastAttemptIdx !== -1) rowData[lastAttemptIdx] = updates.lastAttempt;

  // 3. Append to Archive Sheet
  await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: `${archiveSheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });

  // 4. Clear the row in Main Sheet
  await sheets.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range: `${mainSheetName}!A${rowIndex}:Z${rowIndex}`,
  });

  console.log(`[v0] Lead at row ${rowIndex} archived to ${archiveSheetName}`);
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

  // CHECK FOR AUTO-ARCHIVE
  if (updates.status === 'disconnected' || updates.status === 'not-in-service') {
    console.log(`[v0] Status is ${updates.status}. Initiating auto-archive for row ${rowIndex}...`);
    await archiveLead(auth, spreadsheetId, rowIndex, sheetName, updates);
    return;
  }

  // Normal Update Logic
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

  console.log('[v0] ===== NOTES DEBUG =====');
  console.log('[v0] Notes value being sent:', updates.notes);
  console.log('[v0] Notes length:', updates.notes?.length || 0);
  console.log('[v0] Notes column (Q):', indexToLetter(notesColIndex));
  console.log('[v0] Update data:', JSON.stringify(updateData, null, 2));
  console.log('[v0] ===========================');

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
