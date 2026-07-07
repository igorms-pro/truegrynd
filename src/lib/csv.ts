/**
 * Minimal CSV parser for the member-import wizard: auto-detects `,` vs `;` (French exports
 * from Peppy/Resawod are usually `;`), handles quoted fields with embedded delimiters and
 * doubled quotes, CRLF/CR line ends. Good enough for roster exports; not a full RFC engine.
 */
export type ParsedCsv = { headers: string[]; rows: string[][] };

function detectDelimiter(firstLine: string): string {
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  return semis > commas ? ';' : ',';
}

export function parseCsv(text: string): ParsedCsv {
  const clean = text.replace(/^﻿/, '');
  const firstNewline = clean.indexOf('\n');
  const delimiter = detectDelimiter(firstNewline === -1 ? clean : clean.slice(0, firstNewline));

  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field.trim());
    field = '';
  };
  const pushRow = () => {
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      pushField();
    } else if (ch === '\n') {
      pushField();
      pushRow();
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  pushField();
  pushRow();

  const [headers = [], ...data] = rows;
  return { headers, rows: data };
}
