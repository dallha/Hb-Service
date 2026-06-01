/**
 * Script d'import du fichier comptable "Fiche comptable hb parfumerie.xlsx"
 *
 * Usage:
 *   node scripts/import-transactions.mjs
 *
 * Ce script parse le fichier XLSX, extrait les transactions (dépenses/recettes)
 * et les importe dans la base de données via Prisma.
 */

import fs from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const XLSX_PATH = process.env.XLSX_PATH || 'download/Fiche comptable hb parfumerie.xlsx';

// ─── XLSX Parser (minimal, sans dépendance) ─────────────────────

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

function readUInt16LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8);
}

function readUInt32LE(buffer, offset) {
  return (buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;
}

function decodeUtf8(buffer) {
  return new TextDecoder('utf-8').decode(buffer);
}

function decodeXmlEntities(text) {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
}

function findEndOfCentralDirectory(buffer) {
  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (readUInt32LE(buffer, offset) === END_OF_CENTRAL_DIRECTORY_SIGNATURE) return offset;
  }
  throw new Error('Impossible de lire le fichier Excel');
}

function unzipXlsx(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = readUInt32LE(buffer, eocdOffset + 12);
  const centralDirectoryOffset = readUInt32LE(buffer, eocdOffset + 16);
  const entries = new Map();

  let offset = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (offset < end) {
    const signature = readUInt32LE(buffer, offset);
    if (signature !== CENTRAL_DIRECTORY_SIGNATURE) break;

    const compressionMethod = readUInt16LE(buffer, offset + 10);
    const compressedSize = readUInt32LE(buffer, offset + 20);
    const fileNameLength = readUInt16LE(buffer, offset + 28);
    const extraFieldLength = readUInt16LE(buffer, offset + 30);
    const fileCommentLength = readUInt16LE(buffer, offset + 32);
    const localHeaderOffset = readUInt32LE(buffer, offset + 42);
    const fileName = decodeUtf8(buffer.slice(offset + 46, offset + 46 + fileNameLength));

    const localSignature = readUInt32LE(buffer, localHeaderOffset);
    if (localSignature !== LOCAL_FILE_HEADER_SIGNATURE) throw new Error(`Entrée ZIP invalide: ${fileName}`);

    const localFileNameLength = readUInt16LE(buffer, localHeaderOffset + 26);
    const localExtraFieldLength = readUInt16LE(buffer, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);

    let data;
    if (compressionMethod === 0) data = compressed;
    else if (compressionMethod === 8) data = inflateRawSync(compressed);
    else throw new Error(`Méthode de compression non supportée: ${compressionMethod}`);

    entries.set(fileName, data);
    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function parseSharedStrings(xml) {
  const strings = [];
  const siMatches = xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g);
  for (const match of siMatches) {
    const block = match[1] || '';
    const textParts = [...block.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeXmlEntities(m[1] || ''));
    strings.push(textParts.join(''));
  }
  return strings;
}

function parseCellValue(cellXml, sharedStrings) {
  const typeMatch = cellXml.match(/ t="([^"]+)"/);
  const type = typeMatch?.[1] || '';

  // Cellule vide (self-closing, pas de valeur)
  if (cellXml.endsWith('/>')) {
    return '';
  }

  if (type === 'inlineStr') {
    const inlineMatch = cellXml.match(/<is[^>]*>([\s\S]*?)<\/is>/);
    return inlineMatch
      ? decodeXmlEntities(inlineMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      : '';
  }

  if (type === 's') {
    const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
    const index = Number((valueMatch?.[1] || '0').trim());
    return sharedStrings[index] ?? '';
  }

  const valueMatch = cellXml.match(/<v>([\s\S]*?)<\/v>/);
  if (valueMatch) return valueMatch[1].trim();

  const textMatch = cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/);
  if (textMatch) return decodeXmlEntities(textMatch[1].trim());

  return '';
}

function parseWorksheetRows(xml, sharedStrings) {
  const rows = [];
  const rowMatches = xml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g);

  for (const rowMatch of rowMatches) {
    const rowNum = parseInt(rowMatch[1], 10);
    const rowXml = rowMatch[2] || '';
    const cells = [];

    // Match cells: either self-closing (<c ... />) or with content (<c ...>...</c>)
    const cellRegex = /<c\s[^>]*\/>|<c\s[^>]*>[\s\S]*?<\/c>/g;
    const cellMatches = rowXml.matchAll(cellRegex);

    for (const cellMatch of cellMatches) {
      const cellXml = cellMatch[0] || '';
      const refMatch = cellXml.match(/ r="([A-Z]+)(\d+)"/);
      const ref = refMatch ? refMatch[1] : '';
      cells.push({ ref, value: parseCellValue(cellXml, sharedStrings) });
    }

    cells.sort((a, b) => a.ref.localeCompare(b.ref));
    rows.push({ rowNum, cells }); // Keep refs!
  }

  return rows;
}

// ─── Parsing spécifique au fichier comptable ─────────────────────

/**
 * Convertit un nombre série Excel en Date.
 * Excel stocke les dates comme nombre de jours depuis le 30 décembre 1899.
 */
function excelSerialToDate(serial) {
  // Excel serial number: days since 1899-12-30
  // On utilise UTC pour éviter les décalages de fuseau horaire
  const ms = serial * 86400000;
  const date = new Date(Date.UTC(1899, 11, 30) + ms);
  return date;
}

function parseDate(value) {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim();

  // Nombre série Excel (ex: 44625.0)
  const serialMatch = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (serialMatch) {
    const serial = parseFloat(serialMatch[1]);
    if (serial > 40000 && serial < 60000) {
      return excelSerialToDate(serial);
    }
  }

  // YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }

  // DD/MM/YYYY
  const frMatch = cleaned.match(/^(\d{2})[/](\d{2})[/](\d{4})$/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }

  // DDMMYYYY (sans séparateur, comme "01/072022" qui est en fait "01072022")
  const compactMatch = cleaned.match(/^(\d{2})\/?(\d{2})\/?(\d{4})$/);
  if (compactMatch) {
    const [, d, m, y] = compactMatch;
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }

  return null;
}

function parseAmount(value) {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim().replace(/\s/g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log(`📂 Lecture du fichier: ${XLSX_PATH}`);

  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`❌ Fichier introuvable: ${XLSX_PATH}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(XLSX_PATH);
  const entries = unzipXlsx(buffer);

  // Shared strings
  const sharedStringsXml = entries.get('xl/sharedStrings.xml');
  const sharedStrings = sharedStringsXml ? parseSharedStrings(decodeUtf8(sharedStringsXml)) : [];

  // Première feuille
  const worksheetNames = [...entries.keys()]
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort();
  const worksheetXml = worksheetNames.length > 0
    ? entries.get(worksheetNames[0])
    : entries.get('xl/worksheets/sheet1.xml');

  if (!worksheetXml) {
    console.error('❌ Aucune feuille Excel trouvée');
    process.exit(1);
  }

  const rawRows = parseWorksheetRows(decodeUtf8(worksheetXml), sharedStrings);

  console.log(`📊 Lignes brutes trouvées: ${rawRows.length}`);

  // Afficher les premières lignes pour debug
  for (const row of rawRows.slice(0, 5)) {
    const vals = row.cells.map((c) => `${c.ref}=${c.value}`);
    console.log(`   Row ${row.rowNum}: [${vals.join('] [')}]`);
  }

  // La structure du fichier:
  // Row 1: Titre "Fiche comptable hb parfumerie" (cellule fusionnée A1)
  // Row 3: En-têtes: Date (B), Dépenses (C), Recettes (D), Motifs dépenses (E)
  // Row 4+: Données

  // Trouver la ligne d'en-tête (celle qui contient "Date")
  let headerRow = null;
  let dataStartRow = null;

  for (const row of rawRows) {
    const hasDate = row.cells.some((c) => c.value === 'Date');
    const hasDepenses = row.cells.some((c) => c.value === 'Dépenses');
    if (hasDate && hasDepenses) {
      headerRow = row;
      dataStartRow = row.rowNum + 1;
      break;
    }
  }

  if (!headerRow) {
    console.error('❌ En-têtes (Date, Dépenses, Recettes) introuvables');
    process.exit(1);
  }

  const headerVals = headerRow.cells.map((c) => `${c.ref}=${c.value}`);
  console.log(`\n📋 En-têtes trouvés à la ligne ${headerRow.rowNum}: [${headerVals.join(', ')}]`);
  console.log(`📊 Données à partir de la ligne ${dataStartRow}`);


  // Parser les transactions
  const transactions = [];
  let skipped = 0;

  for (const row of rawRows) {
    if (row.rowNum < dataStartRow) continue;

    // Construire un map colonne -> valeur à partir des références
    const cellMap = {};
    for (const cell of row.cells) {
      cellMap[cell.ref] = cell.value;
    }

    const dateStr = cellMap['B'] || '';  // Colonne B = Date
    const depenseStr = cellMap['C'] || ''; // Colonne C = Dépenses
    const recetteStr = cellMap['D'] || ''; // Colonne D = Recettes
    const motifStr = cellMap['E'] || '';   // Colonne E = Motifs dépenses



    const date = parseDate(dateStr);
    if (!date) {
      skipped++;
      continue;
    }

    const depense = parseAmount(depenseStr);
    const recette = parseAmount(recetteStr);

    if (depense === null && recette === null) {
      skipped++;
      continue;
    }

    const motif = motifStr
      ? motifStr.trim().toLowerCase().replace(/\s+/g, ' ').trim()
      : '';

    if (depense !== null) {
      transactions.push({
        date,
        type: 'expense',
        amount: depense,
        motif: motif || null,
        source: 'xlsx',
      });
    }

    if (recette !== null) {
      transactions.push({
        date,
        type: 'revenue',
        amount: recette,
        motif: motif || null,
        source: 'xlsx',
      });
    }
  }

  console.log(`\n📦 Transactions parsées: ${transactions.length}`);
  if (skipped > 0) console.log(`⏭️  Lignes ignorées: ${skipped}`);

  if (transactions.length === 0) {
    console.log('❌ Aucune transaction à importer');
    await prisma.$disconnect();
    return;
  }

  // Supprimer les anciennes transactions de la même source
  console.log('\n🗑️  Suppression des anciennes transactions source "xlsx"...');
  const deleted = await prisma.transaction.deleteMany({
    where: { source: 'xlsx' },
  });
  console.log(`   ${deleted.count} supprimées`);

  // Importer par lots
  console.log('\n💾 Importation des transactions...');
  const BATCH_SIZE = 100;
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    await prisma.transaction.createMany({ data: batch });
    console.log(`   ${Math.min(i + BATCH_SIZE, transactions.length)} / ${transactions.length}`);
  }

  // Statistiques
  const count = await prisma.transaction.count();
  const totals = await prisma.transaction.groupBy({
    by: ['type'],
    _sum: { amount: true },
    _count: { amount: true },
  });

  const expenseTotal = totals.find((t) => t.type === 'expense');
  const revenueTotal = totals.find((t) => t.type === 'revenue');

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RÉCAPITULATIF');
  console.log('═══════════════════════════════════════');
  console.log(`Total transactions: ${count}`);
  console.log(`Dépenses:  ${expenseTotal?._count.amount ?? 0} lignes, ${(expenseTotal?._sum.amount ?? 0).toLocaleString('fr-FR')} FCFA`);
  console.log(`Recettes:  ${revenueTotal?._count.amount ?? 0} lignes, ${(revenueTotal?._sum.amount ?? 0).toLocaleString('fr-FR')} FCFA`);
  console.log('═══════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exitCode = 1;
});
