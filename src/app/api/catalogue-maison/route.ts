import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

const COLLECTION_SLUG = 'catalogue-maison';
const DEFAULT_COLLECTION_NAME = 'Catalogue Maison';

const CSV_HEADERS = [
  'nom',
  'slug',
  'marque',
  'categorie',
  'genre',
  'description',
  'nouveau',
  'page_source',
  'nom_arabe',
  'image_url',
  'taille',
  'prix',
  'prix_barre',
  'stock',
  'sku',
  'ordre',
];

type CsvRow = Record<string, string>;

type RawImportOptions = {
  defaultBrand: string;
  defaultCategory: string;
  defaultGender: string;
  defaultDescription: string;
  defaultSize: string;
  defaultPrice: number;
  defaultCompareAtPrice: number | null;
  defaultStock: number;
  defaultIsNew: boolean;
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function serializeCsv(rows: Record<string, string | number | boolean | null | undefined>[]) {
  const headerLine = CSV_HEADERS.join(',');
  const dataLines = rows.map((row) => CSV_HEADERS.map((key) => escapeCsv(row[key])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];
  let currentField = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          currentField += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      currentRow.push(currentField);
      currentField = '';
      continue;
    }

    if (char === '\n') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  const headers = rows.shift() || [];
  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) =>
      headers.reduce<CsvRow>((acc, header, index) => {
        const key = header.trim();
        if (key) acc[key] = (row[index] ?? '').trim();
        return acc;
      }, {})
    );
}

function parseBoolean(value: string) {
  return ['1', 'true', 'yes', 'oui', 'y', 'oui'].includes(value.trim().toLowerCase());
}

function parseNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function buildRawDescription(name: string, category: string, brand: string) {
  const brandPart = brand.trim() ? `par ${brand.trim()}` : 'par la maison';
  return `${category.trim() || 'Produit'} du catalogue maison, ${brandPart}. Fiche générée à partir de la liste de noms fournie.`;
}

function normalizeDuplicateKey(value: string) {
  return slugify(value) || value.trim().toLowerCase();
}

function buildRawRows(names: string[], options: RawImportOptions) {
  const usedSlugs = new Set<string>();
  const seenNames = new Set<string>();
  const duplicates: string[] = [];
  const rows: CsvRow[] = [];

  names.forEach((name, index) => {
    const cleanName = name.trim();
    const duplicateKey = normalizeDuplicateKey(cleanName);
    if (seenNames.has(duplicateKey)) {
      duplicates.push(cleanName);
      return;
    }
    seenNames.add(duplicateKey);

    const baseSlug = slugify(cleanName || `catalogue-maison-${index + 1}`);
    let slug = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    rows.push({
      nom: cleanName,
      slug,
      marque: options.defaultBrand,
      categorie: options.defaultCategory,
      genre: options.defaultGender,
      description: options.defaultDescription || buildRawDescription(cleanName, options.defaultCategory, options.defaultBrand),
      nouveau: options.defaultIsNew ? 'true' : 'false',
      page_source: '',
      nom_arabe: '',
      image_url: '',
      taille: options.defaultSize,
      prix: String(options.defaultPrice),
      prix_barre: options.defaultCompareAtPrice === null ? '' : String(options.defaultCompareAtPrice),
      stock: String(options.defaultStock),
      sku: '',
      ordre: String(index + 1),
    } satisfies CsvRow);
  });

  return { rows, duplicates };
}

function normalizeNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeRawImportOptions(input?: Partial<RawImportOptions>): RawImportOptions {
  return {
    defaultBrand: input?.defaultBrand?.trim() || 'HB Maison',
    defaultCategory: input?.defaultCategory?.trim() || 'Parfum',
    defaultGender: input?.defaultGender?.trim() || 'U',
    defaultDescription: input?.defaultDescription?.trim() || '',
    defaultSize: input?.defaultSize?.trim() || 'Standard',
    defaultPrice: normalizeNumber(input?.defaultPrice, 0),
    defaultCompareAtPrice: normalizeNullableNumber(input?.defaultCompareAtPrice),
    defaultStock: normalizeNumber(input?.defaultStock, 0),
    defaultIsNew: Boolean(input?.defaultIsNew),
  };
}

function rowToProduct(row: CsvRow, index: number) {
  const name = row.nom?.trim() || row.name?.trim() || '';
  const slug = row.slug?.trim() || slugify(name || `catalogue-maison-${index + 1}`);
  const size = row.taille?.trim() || row.size?.trim() || 'Standard';
  const price = parseNumber(row.prix ?? row.price ?? '') ?? 0;
  const compareAtPrice = parseNumber(row.prix_barre ?? row.compareAtPrice ?? '') ?? null;
  const stock = parseNumber(row.stock ?? '') ?? 0;

  if (!name) {
    throw new Error(`La ligne ${index + 2} doit contenir un nom`);
  }

  return {
    product: {
      name,
      slug,
      brand: row.marque?.trim() || row.brand?.trim() || null,
      description: row.description?.trim() || null,
      notesOlfactives: null,
      inspiration: row.categorie?.trim() || row.category?.trim() || null,
      imageUrl: row.image_url?.trim() || row.imageUrl?.trim() || null,
      galleryUrls: null,
      relatedRitualIds: null,
      gender: row.genre?.trim() || null,
      isNew: parseBoolean(row.nouveau ?? row.isNew ?? ''),
      sourcePage: parseNumber(row.page_source ?? row.sourcePage ?? ''),
      arabicName: row.nom_arabe?.trim() || row.arabicName?.trim() || null,
      lineEquivalent: row.categorie?.trim() || row.category?.trim() || null,
      catalogOrder: parseNumber(row.ordre ?? row.catalogOrder ?? '') ?? index + 1,
      isActive: true,
    },
    variant: {
      size,
      price,
      compareAtPrice,
      stock,
      sku: row.sku?.trim() || null,
    },
  };
}

function buildImportPlan(rows: CsvRow[]) {
  const grouped = new Map<string, { product: ReturnType<typeof rowToProduct>['product']; variants: ReturnType<typeof rowToProduct>['variant'][] }>();

  rows.forEach((row, index) => {
    const { product, variant } = rowToProduct(row, index);
    const existing = grouped.get(product.slug);
    if (existing) {
      existing.variants.push(variant);
    } else {
      grouped.set(product.slug, { product, variants: [variant] });
    }
  });

  const products = [...grouped.values()];
  const productCount = products.length;
  const variantCount = products.reduce((sum, entry) => sum + entry.variants.length, 0);

  return {
    products,
    productCount,
    variantCount,
    preview: products.slice(0, 10).map((entry, index) => ({
      name: entry.product.name,
      slug: entry.product.slug,
      brand: entry.product.brand,
      category: entry.product.inspiration,
      gender: entry.product.gender,
      size: entry.variants[0]?.size || 'Standard',
      price: entry.variants[0]?.price ?? 0,
      stock: entry.variants[0]?.stock ?? 0,
      isNew: entry.product.isNew,
      order: entry.product.catalogOrder ?? index + 1,
    })),
  };
}

async function ensureCollection() {
  return db.collection.upsert({
    where: { slug: COLLECTION_SLUG },
    create: {
      name: DEFAULT_COLLECTION_NAME,
      slug: COLLECTION_SLUG,
      description: 'Catalogue maison du propriétaire, prêt pour import/export CSV.',
      imageUrl: '/images/products/perfume-amber.png',
      heroText: 'Catalogue maison du propriétaire',
      sortOrder: 100,
    },
    update: {
      name: DEFAULT_COLLECTION_NAME,
      description: 'Catalogue maison du propriétaire, prêt pour import/export CSV.',
      imageUrl: '/images/products/perfume-amber.png',
      heroText: 'Catalogue maison du propriétaire',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'export';
    const collection = await ensureCollection();

    if (mode === 'template') {
      const csv = serializeCsv([
        {
          nom: 'Nom du produit',
          slug: 'slug-du-produit',
          marque: 'Maison',
          categorie: 'Parfum',
          genre: 'U',
          description: 'Description courte',
          nouveau: 'false',
          page_source: '',
          nom_arabe: '',
          image_url: '',
          taille: 'Standard',
          prix: 0,
          prix_barre: '',
          stock: 0,
          sku: '',
          ordre: 1,
        },
      ]);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${COLLECTION_SLUG}-template.csv"`,
        },
      });
    }

    const products = await db.product.findMany({
      where: { collectionId: collection.id },
      include: {
        variants: true,
      },
      orderBy: [
        { catalogOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const rows = products.flatMap((product) =>
      product.variants.map((variant, variantIndex) => ({
        nom: product.name,
        slug: product.slug,
        marque: product.brand || '',
        categorie: product.lineEquivalent || '',
        genre: product.gender || '',
        description: product.description || '',
        nouveau: product.isNew ? 'true' : 'false',
        page_source: product.sourcePage ?? '',
        nom_arabe: product.arabicName || '',
        image_url: product.imageUrl || '',
        taille: variant.size || (variantIndex === 0 ? 'Standard' : ''),
        prix: variant.price,
        prix_barre: variant.compareAtPrice ?? '',
        stock: variant.stock,
        sku: variant.sku || '',
        ordre: product.catalogOrder ?? '',
      }))
    );

    const csv = serializeCsv(rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${COLLECTION_SLUG}.csv"`,
      },
    });
  } catch (error) {
    console.error('Owner catalogue export error:', error);
    return NextResponse.json({ error: 'Failed to export catalogue' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let rows: CsvRow[] = [];
    let previewOnly = false;
    let duplicateNames: string[] = [];

    if (contentType.includes('application/json')) {
      const body = await request.json() as {
        names?: unknown;
        rawNames?: unknown;
        defaults?: Partial<RawImportOptions>;
        previewOnly?: boolean;
      };
      const names = toStringList(body.names ?? body.rawNames);
      if (names.length === 0) {
        return NextResponse.json({ error: 'Aucun nom fourni' }, { status: 400 });
      }

      const defaults: RawImportOptions = {
        defaultBrand: body.defaults?.defaultBrand?.trim() || 'HB Maison',
        defaultCategory: body.defaults?.defaultCategory?.trim() || 'Parfum',
        defaultGender: body.defaults?.defaultGender?.trim() || 'U',
        defaultDescription: body.defaults?.defaultDescription?.trim() || '',
        defaultSize: body.defaults?.defaultSize?.trim() || 'Standard',
        defaultPrice: Number.isFinite(body.defaults?.defaultPrice as number) ? Number(body.defaults?.defaultPrice) : 0,
        defaultCompareAtPrice:
          body.defaults?.defaultCompareAtPrice === null || body.defaults?.defaultCompareAtPrice === undefined
            ? null
            : Number.isFinite(body.defaults.defaultCompareAtPrice as number)
              ? Number(body.defaults.defaultCompareAtPrice)
              : null,
        defaultStock: Number.isFinite(body.defaults?.defaultStock as number) ? Number(body.defaults?.defaultStock) : 0,
        defaultIsNew: Boolean(body.defaults?.defaultIsNew),
      };

      const rawRows = buildRawRows(names, defaults);
      rows = rawRows.rows;
      duplicateNames = rawRows.duplicates;
      previewOnly = Boolean(body.previewOnly);
    } else {
      const formData = await request.formData();
      const file = formData.get('file');
      const rawNames = formData.get('rawNames');
      previewOnly = String(formData.get('previewOnly') || '').toLowerCase() === 'true';

      if (typeof rawNames === 'string' && rawNames.trim()) {
        const names = toStringList(rawNames);
        if (names.length === 0) {
          return NextResponse.json({ error: 'Aucun nom fourni' }, { status: 400 });
        }

        const defaults: RawImportOptions = {
          defaultBrand: String(formData.get('defaultBrand') || 'HB Maison').trim(),
          defaultCategory: String(formData.get('defaultCategory') || 'Parfum').trim(),
          defaultGender: String(formData.get('defaultGender') || 'U').trim(),
          defaultDescription: String(formData.get('defaultDescription') || '').trim(),
          defaultSize: String(formData.get('defaultSize') || 'Standard').trim(),
          defaultPrice: parseNumber(String(formData.get('defaultPrice') || '')) ?? 0,
          defaultCompareAtPrice: parseNumber(String(formData.get('defaultCompareAtPrice') || '')),
          defaultStock: parseNumber(String(formData.get('defaultStock') || '')) ?? 0,
          defaultIsNew: parseBoolean(String(formData.get('defaultIsNew') || '')),
        };

        const rawRows = buildRawRows(names, defaults);
        rows = rawRows.rows;
        duplicateNames = rawRows.duplicates;
      } else {
        if (!(file instanceof File)) {
          return NextResponse.json({ error: 'Fichier CSV requis' }, { status: 400 });
        }

        const raw = await file.text();
        if (!raw.trim()) {
          return NextResponse.json({ error: 'Le fichier est vide' }, { status: 400 });
        }

        rows = raw.trim().startsWith('[')
          ? (JSON.parse(raw) as CsvRow[])
          : parseCsv(raw);
      }
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Aucune ligne à importer' }, { status: 400 });
    }

    const importPlan = buildImportPlan(rows);

    if (previewOnly) {
      return NextResponse.json({
        success: true,
        previewOnly: true,
        duplicates: duplicateNames,
        counts: {
          products: importPlan.productCount,
          variants: importPlan.variantCount,
        },
        preview: importPlan.preview,
      });
    }

    const collection = await ensureCollection();

    await db.productVariant.deleteMany({
      where: { product: { collectionId: collection.id } },
    });
    await db.review.deleteMany({
      where: { product: { collectionId: collection.id } },
    });
    await db.product.deleteMany({
      where: { collectionId: collection.id },
    });

    let order = 1;
    for (const entry of importPlan.products) {
      const product = await db.product.create({
        data: {
          ...entry.product,
          collectionId: collection.id,
          catalogOrder: entry.product.catalogOrder || order,
          variants: {
            create: entry.variants.map((variant) => ({
              size: variant.size || 'Standard',
              price: Number.isFinite(variant.price) ? variant.price : 0,
              compareAtPrice: variant.compareAtPrice ?? null,
              stock: Number.isFinite(variant.stock) ? variant.stock : 0,
              sku: variant.sku || null,
            })),
          },
        } as any,
      });
      order += 1;
      void product;
    }

    const productCount = await db.product.count({ where: { collectionId: collection.id } });
    const variantCount = await db.productVariant.count({ where: { product: { collectionId: collection.id } } });

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        slug: COLLECTION_SLUG,
        name: DEFAULT_COLLECTION_NAME,
      },
      counts: {
        products: productCount,
        variants: variantCount,
      },
      duplicates: duplicateNames,
    });
  } catch (error) {
    console.error('Owner catalogue import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import catalogue' },
      { status: 500 }
    );
  }
}
