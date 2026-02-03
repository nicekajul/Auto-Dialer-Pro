# Google Sheet Structure Guide

Your auto-dialer app is now configured to work with your existing Google Sheet structure.

## Expected Column Layout

The app expects your Google Sheet to have the following columns:

| Column | Header | Purpose | Required |
|--------|--------|---------|----------|
| A | Date | Lead date added | No |
| B | Lead Miner | Agent who sourced lead | No |
| C | Publisher | Publishing company | No |
| D | Contact Owner | Contact owner name | No |
| E | Email Address | Contact email | No |
| F | Name | Full contact name | **Yes** |
| G | First Name | First name | No |
| H | Last Name | Last name | No |
| I | BOOK TITLE | Book/project title | No |
| J | Phone Number | Primary phone (PHONE 1) | **Yes** |
| K | PHONE 2 | Secondary phone | No |
| L | PHONE 3 | Third phone | No |
| M | PHONE 4 | Fourth phone | No |
| N | PHONE 5 | Fifth phone | No |
| O | ADDRESS | Contact address | No |
| **P** | **Status** | **Call outcome** | **Yes** |
| **Q** | **Notes** | **Call notes** | No |
| **R** | **Attempts** | **Call attempt count** | No |
| **S** | **Last Attempt** | **Last attempt timestamp** | No |

## Status Values

The app will automatically populate the Status column (P) with these values:

- `pending` - Lead not yet contacted
- `calling` - Currently dialing the lead
- `answered` - Call was answered and completed
- `no-answer` - No one picked up
- `voicemail` - Voicemail was reached
- `busy` - Line was busy

## Column Mapping Details

**Phone Selection**: The app uses the first available phone number from columns J-N (PHONE 1-5). It checks in order and uses the first non-empty phone number.

**Name Field**: Uses column F (Name) to display the contact name in the dialer interface.

**Email Field**: Pulls from column E for reference and records.

**Status Updates**: All call outcomes are written to column P.

**Notes**: Agent notes during/after calls go to column Q.

**Attempts**: Column R auto-increments each time a lead is dialed.

**Last Attempt**: Column S records the timestamp of the most recent attempt.

## Important Notes

1. **Header Row**: Make sure row 1 contains your headers. Data should start in row 2.
2. **Phone Numbers**: Must be in one of columns J-N. The app uses the first available number.
3. **Status Column**: Must be empty or contain valid status values (pending, answered, no-answer, voicemail, busy)
4. **Attempts Number**: Should be a number. The app will auto-increment this.
5. **Sheet Name**: The default sheet name is "Leads" - if you named it something else, you'll need to specify it during setup.

## Example Row

```
01/27/2026 | Amanda Wilson | iUniverse | [owner] | andrewgka@gmail.com | Andrew G. Kadar | Andrew G. | Kadar | The No-Bull Guide | (310) 772-0011 | (310) 880-1989 | ... | [blank] | pending | [blank] | 0 | [blank]
```

## Setup Checklist

- [ ] Verify headers are in row 1
- [ ] Confirm data starts in row 2  
- [ ] Check Status column (P) exists and is labeled "Status"
- [ ] Verify Notes column (Q) exists and is labeled "Notes"
- [ ] Confirm Attempts column (R) exists and is labeled "Attempts"
- [ ] Check Last Attempt column (S) exists and is labeled "Last Attempt"
- [ ] Ensure at least one phone column (J) has phone numbers
- [ ] Test with one lead first before running full dialing campaigns

## Troubleshooting

**Leads not appearing**: Check that column J (Phone Number) has values. Empty phone numbers are filtered out.

**Wrong phone numbers showing**: Verify phone numbers are in columns J-N in the correct order. The app uses the first non-empty value.

**Status not updating**: Make sure column P exists and has "Status" as the header.

**Notes not saving**: Verify column Q is labeled "Notes" and has enough space for your notes.
