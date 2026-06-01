import { inflateRawSync } from 'node:zlib';

type CsvRow = Record<string, string>;

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

function readUInt16LE(buffer: Uint8Array, offset: number) {
  return buffer[offset] | (buffer[offset + 1] << 8);
}

function readUInt32LE(buffer: Uint8Array, offset: number) {
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  ) >>> 0;
}

function decodeUtf8(buffer: Uint8Array) {
  return new TextDecoder('utf-8').decode(buffer);
}

function decodeXmlEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractXmlText(block: string) {
  return decodeXmlEntities(
    block
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function findEndOfCentralDirectory(buffer: Uint8Array) {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (readUInt32LE(buffer, offset) === END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      return offset;
    }
  }
  throw new Error('Impossible de lire le fichier Excel');
}

function unzipXlsx(buffer: Uint8Array) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = readUInt32LE(buffer, eocdOffset + 12);
  const centralDirectoryOffset = readUInt32LE(buffer, eocdOffset + 16);
  const entries = new Map<string, Uint8Array>();

  let offset = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (offset < end) {
    const signature = readUInt32LE(buffer, offset);
    if (signature !== CENTRAL_DIRECTORY_SIGNATURE) {
      break;
    }

    const compressionMethod = readUInt16LE(buffer, offset + 10);
    const compressedSize = readUInt32LE(buffer, offset + 20);
    const fileNameLength = readUInt16LE(buffer, offset + 28);
    const extraFieldLength = readUInt16LE(buffer, offset + 30);
    const fileCommentLength = readUInt16LE(buffer, offset + 32);
    const localHeaderOffset = readUInt32LE(buffer, offset + 42);
    const fileName = decodeUtf8(buffer.slice(offset + 46, offset + 46 + fileNameLength));

    const localSignature = readUInt32LE(buffer, localHeaderOffset);
    if (localSignature !== LOCAL_FILE_HEADER_SIGNATURE) {
      throw new Error(`Entrée ZIP invalide: ${fileName}`);
    }

    const localFileNameLength = readUInt16LE(buffer, localHeaderOffset + 26);
    const localExtraFieldLength = readUInt16LE(buffer, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);

    let data: Uint8Array;
    if (compressionMethod === 0) {
      data = compressed;
    } else if (compressionMethod === 8) {
      data = inflateRawSync(compressed);
    } else {
      throw new Error(`Méthode de compression Excel non supportée: ${compressionMethod}`);
    }

    entries.set(fileName, data);
    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function parseSharedStrings(xml: string) {
  const strings: string[] = [];
  const siMatches = xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g);

  for (const match of siMatches) {
    const block = match[1] || '';
    const textParts = [...block.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeXmlEntities(m[1] || ''));
    strings.push(textParts.join(''));
  }

  return strings;
}

function parseCellValue(cellXml: string, sharedStrings: string[]) {
  // Cellule vide (self-closing)
  if (cellXml.endsWith('/>')) {
    return '';
  }

  const typeMatch = cellXml.match(/ t="([^"]+)"/);
  const type = typeMatch?.[1] || '';

  if (type === 'inlineStr') {
    const inlineMatch = cellXml.match(/<is[^>]*>([\s\S]*?)<\/is>/);
    return inlineMatch ? extractXmlText(inlineMatch[1] || '') : '';
  }

  if (type === 's') {
    const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
    const index = Number((valueMatch?.[1] || '0').trim());
    return sharedStrings[index] ?? '';
  }

  const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
  if (valueMatch) {
    return decodeXmlEntities(valueMatch[1].trim());
  }

  const textMatch = cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/);
  if (textMatch) {
    return decodeXmlEntities(textMatch[1].trim());
  }

  return '';
}

function parseWorksheetRows(xml: string, sharedStrings: string[]) {
  const rows: { rowNum: number; cells: { ref: string; value: string }[] }[] = [];
  const rowMatches = xml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g);

  for (const rowMatch of rowMatches) {
    const rowNum = parseInt(rowMatch[1], 10);
    const rowXml = rowMatch[2] || '';
    const cells: { ref: string; value: string }[] = [];
    // Match both self-closing and regular cells
    const cellRegex = /<c\s[^>]*\/>|<c\s[^>]*>[\s\S]*?<\/c>/g;
    const cellMatches = rowXml.matchAll(cellRegex);

    for (const cellMatch of cellMatches) {
      const cellXml = cellMatch[0] || '';
      const refMatch = cellXml.match(/ r="([A-Z]+)(\d+)"/);
      const ref = refMatch ? refMatch[1] : '';
      cells.push({ ref, value: parseCellValue(cellXml, sharedStrings) });
    }

    cells.sort((a, b) => a.ref.localeCompare(b.ref));
    rows.push({ rowNum, cells });
  }

  return rows;
}

function rowsToCsvRows(rows: { rowNum: number; cells: { ref: string; value: string }[] }[]) {
  const nonEmptyRows = rows.filter((row) => row.cells.some((cell) => cell.value.trim() !== ''));
  const headers = nonEmptyRows.shift()?.cells || [];

  return nonEmptyRows.map((row) => {
    const cellMap: Record<string, string> = {};
    for (const cell of row.cells) {
      cellMap[cell.ref] = cell.value;
    }

    return headers.reduce<CsvRow>((acc, header) => {
      const key = header.value.trim();
      if (key) acc[key] = (cellMap[header.ref] ?? '').trim();
      return acc;
    }, {});
  });
}


export async function parseXlsxFile(file: File): Promise<CsvRow[]> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const entries = unzipXlsx(buffer);

  const sharedStringsXml = entries.get('xl/sharedStrings.xml');
  const sharedStrings = sharedStringsXml ? parseSharedStrings(decodeUtf8(sharedStringsXml)) : [];

  const worksheetNames = [...entries.keys()].filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name)).sort();
  const worksheetXml = worksheetNames.length > 0 ? entries.get(worksheetNames[0]) : entries.get('xl/worksheets/sheet1.xml');

  if (!worksheetXml) {
    throw new Error('Aucune feuille Excel trouvée');
  }

  const rows = parseWorksheetRows(decodeUtf8(worksheetXml), sharedStrings);
  return rowsToCsvRows(rows);
}
