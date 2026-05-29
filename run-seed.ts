import { seedDatabase } from './src/lib/seed';

async function main() {
  console.log('Seeding database...');
  try {
    await seedDatabase();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed:', error);
  }
}

main();
