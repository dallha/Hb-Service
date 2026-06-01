import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';
import { parseXlsxFile } from '@/lib/xlsx-parser';

/**
 * API des transactions comptables
 * GET  /api/transactions → liste toutes les transactions
 * POST /api/transactions → import depuis un fichier XLSX/CSV
 */

function parseDate(value: string): Date | null {
  if (!value || !value.trim()) return null;

  const cleaned = value.trim();

  // Format: YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }

  // Format: DD/MM/YYYY ou DD/MM/YYYY
  const frMatch = cleaned.match(/^(\d{2})[/](\d{2})[/](\d{4})$/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }

  // Format: DDMMYYYY (sans séparateur)
  const compactMatch = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (compactMatch) {
    const [, d, m, y] = compactMatch;
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }

  return null;
}

function parseAmount(value: string): number | null {
  if (!value || !value.trim()) return null;
  const cleaned = value.trim().replace(/\s/g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function normalizeMotif(value: string): string {
  if (!value || !value.trim()) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type ParsedRow = {
  date: Date;
  depense: number | null;
  recette: number | null;
  motif: string;
};

function parseRows(rows: Record<string, string>[]): ParsedRow[] {
  const results: ParsedRow[] = [];

  for (const row of rows) {
    // Chercher les colonnes par différents noms possibles
    const dateStr = row.Date || row.date || row.DATE || '';
    const depenseStr = row.Dépenses || row.depenses || row.Depenses || row.dépense || row.depense || row.Dépense || '';
    const recetteStr = row.Recettes || row.recettes || row.Recette || row.recette || '';
    const motifStr = row['Motifs dépenses'] || row.motifs_depenses || row.motif || row.Motif || row['Motifs dépense'] || '';

    const date = parseDate(dateStr);
    if (!date) continue;

    const depense = parseAmount(depenseStr);
    const recette = parseAmount(recetteStr);

    // Skip les lignes vides (ni dépense ni recette)
    if (depense === null && recette === null) continue;

    results.push({
      date,
      depense,
      recette,
      motif: normalizeMotif(motifStr),
    });
  }

  return results;
}

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let rows: Record<string, string>[] = [];

    if (contentType.includes('application/json')) {
      const body = await request.json() as {
        rows?: Record<string, string>[];
        file?: string;
      };

      if (body.rows && Array.isArray(body.rows)) {
        rows = body.rows;
      } else {
        return NextResponse.json({ error: 'Aucune donnée fournie' }, { status: 400 });
      }
    } else {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Fichier XLSX requis' }, { status: 400 });
      }

      const fileName = file.name.toLowerCase();
      const isXlsx = fileName.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (isXlsx) {
        rows = await parseXlsxFile(file);
      } else {
        return NextResponse.json({ error: 'Format non supporté. Utilisez un fichier XLSX.' }, { status: 400 });
      }
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Aucune ligne trouvée dans le fichier' }, { status: 400 });
    }

    const parsed = parseRows(rows);

    if (parsed.length === 0) {
      return NextResponse.json({ error: 'Aucune transaction valide trouvée. Vérifiez les colonnes (Date, Dépenses, Recettes, Motifs dépenses).' }, { status: 400 });
    }

    // Insérer les transactions
    const transactions: {
      date: Date;
      type: string;
      amount: number;
      motif: string | null;
      source: string;
    }[] = [];
    for (const item of parsed) {
      if (item.depense !== null) {
        transactions.push({
          date: item.date,
          type: 'expense',
          amount: item.depense,
          motif: item.motif || null,
          source: 'xlsx',
        });
      }
      if (item.recette !== null) {
        transactions.push({
          date: item.date,
          type: 'revenue',
          amount: item.recette,
          motif: item.motif || null,
          source: 'xlsx',
        });
      }
    }


    // Supprimer les anciennes transactions de la même source avant d'importer
    await db.transaction.deleteMany({
      where: { source: 'xlsx' },
    });

    // Insérer par lots
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await db.transaction.createMany({ data: batch });
    }

    const count = await db.transaction.count();

    // Calculer les totaux
    const totals = await db.transaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
      _count: { amount: true },
    });

    const expenseTotal = totals.find((t) => t.type === 'expense');
    const revenueTotal = totals.find((t) => t.type === 'revenue');

    return NextResponse.json({
      success: true,
      count,
      transactions: transactions.length,
      totals: {
        depenses: expenseTotal?._sum.amount ?? 0,
        recettes: revenueTotal?._sum.amount ?? 0,
        nbDepenses: expenseTotal?._count.amount ?? 0,
        nbRecettes: revenueTotal?._count.amount ?? 0,
      },
      periode: {
        debut: parsed[0]?.date.toISOString().split('T')[0],
        fin: parsed[parsed.length - 1]?.date.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Transactions import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'import' },
      { status: 500 }
    );
  }
}
