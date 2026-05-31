/**
 * Seed Data for HB_Service Luxury E-commerce
 * Populates the database with premium collections and products
 */
import { db } from './db';

export async function seedDatabase() {
  // Check if already seeded
  const existingCollections = await db.collection.count();
  if (existingCollections > 0) return;

  // ─── Collections ───────────────────────────────────────────
  const signature = await db.collection.create({
    data: {
      name: 'Collection Signature',
      slug: 'signature',
      description: 'Nos créations signatures, l\'essence même du savoir-faire HB_Service. Des parfums qui définissent l\'élégance africaine contemporaine, alliant tradition et modernité dans chaque flacon.',
      imageUrl: '/images/collections/signature.png',
      heroText: 'L\'élégance absolue, redéfinie',
      sortOrder: 1,
    },
  });

  const heritage = await db.collection.create({
    data: {
      name: 'Collection Héritage',
      slug: 'heritage',
      description: 'Oud, résines précieuses et bois nobles. Un voyage olfactif au cœur des traditions millénaires, où chaque fragrance raconte l\'histoire d\'un héritage ancestral préservé avec passion.',
      imageUrl: '/images/collections/heritage.png',
      heroText: 'L\'héritage olfactif des terres sacrées',
      sortOrder: 2,
    },
  });

  const botanique = await db.collection.create({
    data: {
      name: 'Collection Botanique',
      slug: 'botanique',
      description: 'Soins naturels d\'exception, formulés avec des ingrédients purs et biologiques. Le meilleur de la nature au service de votre beauté, sans compromis sur la qualité ni sur l\'éthique.',
      imageUrl: '/images/collections/botanique.png',
      heroText: 'La pureté du naturel, sublimée',
      sortOrder: 3,
    },
  });

  console.log('✅ Database seeded successfully');
}
