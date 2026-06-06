import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Adding Home Spray HB_Service 500ml...');

  // Ensure "catalogue-maison" collection exists
  let collection = await db.collection.findUnique({
    where: { slug: 'catalogue-maison' }
  });

  if (!collection) {
    collection = await db.collection.create({
      data: {
        name: 'Catalogue Maison',
        slug: 'catalogue-maison',
        description: "Découvrez nos bougies et parfums d'intérieur pour une ambiance unique.",
      }
    });
    console.log('Created collection catalogue-maison');
  }

  // Create the 500ml product
  const slug = 'home-spray-hb-service-500ml';
  const existingProduct = await db.product.findUnique({ where: { slug } });
  
  if (existingProduct) {
    console.log('Product already exists! Updating...');
    await db.product.update({
      where: { slug },
      data: {
        description: "Parfumez instantanément votre intérieur avec le Home Spray HB_Service. Sa formule spécialement conçue diffuse une fragrance agréable et durable qui rafraîchit l'atmosphère de votre maison, bureau, voiture ou espace professionnel.\n\n✔ Parfum immédiat et longue tenue\n✔ Neutralise les mauvaises odeurs\n✔ Utilisation simple et pratique\n✔ Convient à toutes les pièces de la maison",
        imageUrl: '/images/products/home-spray-500ml.jpg',
        isNew: true,
      }
    });
    
    // Check variant
    const variants = await db.productVariant.findMany({ where: { productId: existingProduct.id } });
    if (variants.length === 0) {
      await db.productVariant.create({
        data: {
          productId: existingProduct.id,
          size: '500ml',
          price: 7740, // 129 DH * 60
          stock: 50,
        }
      });
    }
  } else {
    const product = await db.product.create({
      data: {
        name: 'Home Spray HB_Service - 500 ml',
        slug: 'home-spray-hb-service-500ml',
        description: "Parfumez instantanément votre intérieur avec le Home Spray HB_Service. Sa formule spécialement conçue diffuse une fragrance agréable et durable qui rafraîchit l'atmosphère de votre maison, bureau, voiture ou espace professionnel.\n\n✔ Parfum immédiat et longue tenue\n✔ Neutralise les mauvaises odeurs\n✔ Utilisation simple et pratique\n✔ Convient à toutes les pièces de la maison",
        imageUrl: '/images/products/home-spray-500ml.jpg',
        isNew: true,
        collectionId: collection.id,
        isActive: true,
        variants: {
          create: [
            {
              size: '500ml',
              price: 7740, // 129 DH * 60
              stock: 50,
            }
          ]
        }
      }
    });
    console.log('Created product:', product.name);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
