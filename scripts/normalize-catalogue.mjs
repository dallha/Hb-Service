import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const demoSlugs = ['signature', 'heritage', 'botanique'];

async function main() {
  const collection = await prisma.collection.upsert({
    where: { slug: 'catalogue-2026' },
    create: {
      name: 'Sélection Parfum 2026',
      slug: 'catalogue-2026',
      description: 'Sélection réelle du catalogue Mars 2026, organisée pour une lecture professionnelle par marque, genre et nouveauté.',
      heroText: 'La sélection parfum complète',
      imageUrl: '/images/products/perfume-amber.png',
      sortOrder: 99,
    },
    update: {
      name: 'Sélection Parfum 2026',
      description: 'Sélection réelle du catalogue Mars 2026, organisée pour une lecture professionnelle par marque, genre et nouveauté.',
      heroText: 'La sélection parfum complète',
      imageUrl: '/images/products/perfume-amber.png',
    },
  });

  await prisma.$executeRaw`
    UPDATE "Product"
    SET "description" = concat(
      'Référence ',
      CASE
        WHEN "gender" = 'H' THEN 'homme'
        WHEN "gender" = 'F' THEN 'femme'
        ELSE 'unisexe'
      END,
      ' du catalogue Mars 2026',
      CASE
        WHEN "brand" IS NOT NULL AND "brand" <> '' THEN concat(', signée ', "brand")
        ELSE ''
      END,
      '. Indexée pour une consultation rapide par marque, genre et page source.'
    )
    WHERE "collectionId" = ${collection.id}
  `;

  await prisma.product.deleteMany({
    where: {
      collection: {
        slug: {
          in: demoSlugs,
        },
      },
    },
  });

  await prisma.collection.deleteMany({
    where: {
      slug: {
        in: demoSlugs,
      },
    },
  });

  const [collectionCount, productCount] = await Promise.all([
    prisma.collection.count(),
    prisma.product.count({ where: { collectionId: collection.id } }),
  ]);

  console.log(JSON.stringify({
    collection: {
      id: collection.id,
      name: 'Sélection Parfum 2026',
      slug: 'catalogue-2026',
      productCount,
    },
    totals: {
      collections: collectionCount,
      demoSlugsRemoved: demoSlugs,
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
