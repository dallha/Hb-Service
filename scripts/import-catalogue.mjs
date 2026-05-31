import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const SOURCE_PATH = process.env.CATALOGUE_SOURCE || '/private/tmp/catalogue_parfums_mars_2026_pages.json';
const BATCH_SIZE = Number(process.env.CATALOGUE_BATCH_SIZE || 150);

const prisma = new PrismaClient();

const normalizeSpaces = (s) => s.replace(/\s+/g, ' ').trim();
const stripArabicPrefix = (s) => normalizeSpaces(s.replace(/^[\u0600-\u06FF\s]+/g, ''));
const cleanName = (s) => stripArabicPrefix(normalizeSpaces(s));

function guessBrand(core) {
  const tokens = core.split(' ').filter(Boolean);
  if (tokens.length === 0) return '';
  if (/^(By|by)$/.test(tokens[0]) && tokens[1]) return tokens.slice(0, 2).join(' ');
  let i = 0;
  while (i < tokens.length && /^[A-ZÀ-ÖØ-Þ0-9&'\\-\\.]+$/.test(tokens[i])) i += 1;
  if (i > 0) return tokens.slice(0, i).join(' ');
  return tokens[0];
}

function parseLine(line) {
  const raw = normalizeSpaces(line);
  const m = raw.match(/^(.*?)(?:\s+New)?\s+([HFU])$/);
  if (!m) return null;
  const core = normalizeSpaces(m[1]);
  const gender = m[2];
  const isNew = /\sNew\s+[HFU]$/.test(raw);
  const parts = core.split('|').map((s) => normalizeSpaces(s)).filter(Boolean);

  let brand = '';
  let name = '';
  let arabicName = null;

  if (parts.length >= 3) {
    brand = parts[0];
    name = cleanName(parts[1]);
    arabicName = cleanName(parts.slice(2).join(' | '));
  } else if (parts.length === 2) {
    brand = parts[0];
    name = cleanName(parts[1]);
    if (/^[\u0600-\u06FF\s]+$/.test(parts[1])) arabicName = cleanName(parts[1]);
  } else {
    brand = guessBrand(core);
    name = cleanName(core.slice(brand.length).trim()) || core;
  }

  if (!name) name = core;
  return { brand, name, arabicName, gender, isNew, core };
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

async function main() {
  const pages = JSON.parse(await fs.readFile(SOURCE_PATH, 'utf8'));

  const entries = [];
  for (const page of pages) {
    if (page.page < 3) continue;
    const lines = page.text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line === 'Marque Dans la ligne de/Odeur similaire de sexe') continue;
      if (/^\d+$/.test(line)) continue;
      const parsed = parseLine(line);
      if (!parsed) continue;
      entries.push({ page: page.page, ...parsed });
    }
  }

  const collection = await prisma.collection.upsert({
    where: { slug: 'catalogue-2026' },
    create: {
      name: 'Sélection Parfum 2026',
      slug: 'catalogue-2026',
      description: 'Sélection réelle du catalogue Mars 2026, organisée pour une lecture professionnelle par marque, genre et nouveauté.',
      heroText: 'La sélection parfum complète',
      sortOrder: 99,
    },
    update: {
      name: 'Sélection Parfum 2026',
      description: 'Sélection réelle du catalogue Mars 2026, organisée pour une lecture professionnelle par marque, genre et nouveauté.',
      heroText: 'La sélection parfum complète',
    },
  });

  await prisma.productVariant.deleteMany({
    where: { product: { collectionId: collection.id } },
  });
  await prisma.review.deleteMany({
    where: { product: { collectionId: collection.id } },
  });
  await prisma.product.deleteMany({
    where: { collectionId: collection.id },
  });

  const products = [];
  const variants = [];

  entries.forEach((item, index) => {
    const productId = `catalogue-${item.page}-${String(index + 1).padStart(4, '0')}-${randomUUID().slice(0, 8)}`;
    const slug = `catalogue-2026-p${String(item.page).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`;

    products.push({
      id: productId,
      collectionId: collection.id,
      brand: item.brand || null,
      name: item.name,
      slug,
      description: `Référence ${item.gender === 'H' ? 'homme' : item.gender === 'F' ? 'femme' : 'unisexe'} du catalogue Mars 2026${item.brand ? `, signée ${item.brand}` : ''}. Indexée pour une consultation rapide par marque, genre et page source.`,
      notesOlfactives: null,
      inspiration: item.core,
      imageUrl: null,
      galleryUrls: null,
      relatedRitualIds: null,
      gender: item.gender,
      isNew: item.isNew,
      sourcePage: item.page,
      arabicName: item.arabicName,
      lineEquivalent: null,
      catalogOrder: index + 1,
      isActive: true,
    });

    variants.push({
      id: `variant-${productId}`,
      productId,
      size: 'Catalogue',
      price: 0,
      compareAtPrice: null,
      stock: 0,
      sku: `CAT-${String(item.page).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`,
    });
  });

  for (const [index, productBatch] of chunk(products, BATCH_SIZE).entries()) {
    const variantBatch = variants.slice(index * BATCH_SIZE, index * BATCH_SIZE + productBatch.length);
    await prisma.product.createMany({ data: productBatch, skipDuplicates: true });
    await prisma.productVariant.createMany({ data: variantBatch, skipDuplicates: true });
    console.log(`imported ${Math.min((index + 1) * BATCH_SIZE, products.length)} / ${products.length}`);
  }

  const count = await prisma.product.count({ where: { collectionId: collection.id } });
  console.log(`catalogue product count: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
