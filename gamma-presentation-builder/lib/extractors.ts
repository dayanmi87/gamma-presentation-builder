import AdmZip from 'adm-zip';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export type ExtractedFile = {
  fileName: string;
  mimeType: string;
  size: number;
  extractedText: string;
};

function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default as any;
  const data = await pdfParse(buffer);
  return data.text || '';
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

function extractSpreadsheet(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const chunks: string[] = [];
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    chunks.push(`גיליון: ${sheetName}`);
    chunks.push(JSON.stringify(rows.slice(0, 300), null, 2));
  });
  return chunks.join('\n\n');
}

function extractPptx(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const slideEntries = entries
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.entryName))
    .sort((a, b) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }));

  return slideEntries
    .map((entry, index) => {
      const xml = entry.getData().toString('utf8');
      const matches = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)].map((m) => cleanText(m[1]));
      return `שקופית ${index + 1}:\n${matches.filter(Boolean).join('\n')}`;
    })
    .join('\n\n');
}

export async function extractFile(file: File): Promise<ExtractedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name;
  const lower = fileName.toLowerCase();
  const mimeType = file.type || 'application/octet-stream';
  let extractedText = '';

  if (lower.endsWith('.pdf') || mimeType.includes('pdf')) {
    extractedText = await extractPdf(buffer);
  } else if (lower.endsWith('.docx')) {
    extractedText = await extractDocx(buffer);
  } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
    extractedText = extractSpreadsheet(buffer);
  } else if (lower.endsWith('.pptx')) {
    extractedText = extractPptx(buffer);
  } else if (lower.endsWith('.txt') || lower.endsWith('.md') || mimeType.startsWith('text/')) {
    extractedText = buffer.toString('utf8');
  } else if (mimeType.startsWith('image/')) {
    extractedText = `קובץ תמונה שהועלה כ-reference ויזואלי: ${fileName}. נתח את הסגנון לפי שם/הקשר, ואם נדרש נבקש בהמשך תמיכה בראיית תמונה.`;
  } else {
    extractedText = `סוג קובץ לא נתמך לחילוץ טקסט אוטומטי: ${fileName}`;
  }

  return {
    fileName,
    mimeType,
    size: file.size,
    extractedText: extractedText.slice(0, 120000)
  };
}
