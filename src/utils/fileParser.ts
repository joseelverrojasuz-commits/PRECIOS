import * as XLSX from 'xlsx';

export interface ParsedFileResult {
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'xls' | 'json' | 'txt';
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
  previewRows: Record<string, any>[];
  error?: string;
}

/**
 * Detect delimiter for CSV / TXT files
 */
function detectDelimiter(text: string): string {
  const firstLines = text.split('\n').slice(0, 5).join('\n');
  const counts = {
    ',': (firstLines.match(/,/g) || []).length,
    ';': (firstLines.match(/;/g) || []).length,
    '\t': (firstLines.match(/\t/g) || []).length,
    '|': (firstLines.match(/\|/g) || []).length,
  };

  let maxDelim = ',';
  let maxCount = 0;
  for (const [delim, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxDelim = delim;
    }
  }
  return maxDelim;
}

/**
 * Simple robust CSV / TXT parser
 */
function parseDelimitedText(text: string, delimiter?: string): { columns: string[]; rows: Record<string, any>[] } {
  const delim = delimiter || detectDelimiter(text);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { columns: [], rows: [] };

  // Helper to split row respecting quotes
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delim && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = splitLine(lines[0]);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length === 0 || (cells.length === 1 && cells[0] === '')) continue;
    const rowObj: Record<string, any> = {};

    headers.forEach((h, idx) => {
      const val = cells[idx] !== undefined ? cells[idx] : null;
      // Auto convert numbers
      if (val !== null && val !== '') {
        const cleaned = String(val).replace(/[$,€\s]/g, '').replace(',', '.');
        const num = Number(cleaned);
        rowObj[h] = !isNaN(num) && cleaned !== '' ? num : val;
      } else {
        rowObj[h] = null;
      }
    });

    rows.push(rowObj);
  }

  return { columns: headers, rows };
}

/**
 * Parse an uploaded file into columns and dataset rows
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase();

  try {
    if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });

      const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
      return {
        fileName,
        fileType: ext as 'xlsx' | 'xls',
        columns,
        rows: jsonData,
        totalRows: jsonData.length,
        previewRows: jsonData.slice(0, 5),
      };
    } else if (ext === 'json') {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rows: Record<string, any>[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.data)
        ? parsed.data
        : Array.isArray(parsed.rows)
        ? parsed.rows
        : [];

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      return {
        fileName,
        fileType: 'json',
        columns,
        rows,
        totalRows: rows.length,
        previewRows: rows.slice(0, 5),
      };
    } else {
      // CSV or TXT
      const text = await file.text();
      const { columns, rows } = parseDelimitedText(text);
      return {
        fileName,
        fileType: (ext === 'csv' ? 'csv' : 'txt') as 'csv' | 'txt',
        columns,
        rows,
        totalRows: rows.length,
        previewRows: rows.slice(0, 5),
      };
    }
  } catch (err: any) {
    return {
      fileName,
      fileType: 'csv',
      columns: [],
      rows: [],
      totalRows: 0,
      previewRows: [],
      error: `Error al procesar el archivo: ${err?.message || 'Formato no válido o archivo corrupto'}`,
    };
  }
}
