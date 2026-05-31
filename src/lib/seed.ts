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
  await db.collection.create({
    data: {
      name: 'Sélection Parfum 2026',
      slug: 'catalogue-2026',
      description: 'Sélection réelle du catalogue Mars 2026, pensée pour une lecture professionnelle par marque, genre et nouveauté.',
      imageUrl: '/images/products/perfume-amber.png',
      heroText: 'La sélection parfum complète',
      sortOrder: 1,
    },
  });

  console.log('✅ Database seeded successfully');
}
