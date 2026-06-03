import { db } from '../src/lib/db';

async function main() {
  console.log('Updating Bougie image...');
  try {
    const slug = 'bougie-parfumee-hb-service-380g';
    await db.product.update({
      where: { slug },
      data: {
        imageUrl: '/images/products/bougie-fruits-rouges.jpg'
      }
    });
    console.log('✅ Image URL updated for the candle.');
  } catch (error) {
    console.error('Error updating image:', error);
  } finally {
    await db.$disconnect();
  }
}

main();
