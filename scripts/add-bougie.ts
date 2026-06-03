import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding Bougie Parfumée HB_Service...');
  
  try {
    // 1. Check or create the 'catalogue-maison' collection
    let collection = await db.collection.findUnique({
      where: { slug: 'catalogue-maison' }
    });

    if (!collection) {
      collection = await db.collection.create({
        data: {
          name: 'Catalogue Maison',
          slug: 'catalogue-maison',
          description: "Produits d'ambiance et de maison",
          sortOrder: 10,
        }
      });
      console.log('✅ Collection "Catalogue Maison" créée.');
    } else {
      console.log('✅ Collection "Catalogue Maison" existante trouvée.');
    }

    // 2. Add the Product
    const slug = 'bougie-parfumee-hb-service-380g';
    let product = await db.product.findUnique({
      where: { slug }
    });

    if (!product) {
      product = await db.product.create({
        data: {
          name: 'Bougie Parfumée HB_Service',
          slug,
          description: 'Transformez votre intérieur en un véritable havre de paix grâce à notre bougie parfumée artisanale HB_Service. Fabriquée avec des matières premières de qualité et délicatement parfumée, elle diffuse une fragrance élégante et durable qui crée une ambiance chaleureuse et relaxante dans votre maison.\\n\\n✔ Longue durée de combustion\\n✔ Parfum raffiné et intense\\n✔ Idéale pour le salon, la chambre ou le bureau\\n✔ Excellente idée cadeau',
          collectionId: collection.id,
          isActive: true,
          isNew: true,
          variants: {
            create: {
              size: '380 g',
              price: 5940, // FCFA base price, will show as ~99 DH
              stock: 100,
            }
          }
        }
      });
      console.log('✅ Produit "Bougie Parfumée HB_Service" créé avec succès.');
    } else {
      console.log('⚠️ Produit "Bougie Parfumée HB_Service" existe déjà.');
    }

  } catch (error) {
    console.error('Failed to add product:', error);
  } finally {
    await db.$disconnect();
  }
}

main();
