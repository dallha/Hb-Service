import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Adding Bougie Parfumée HB_Service 760g...');

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

  // Create the 760g product
  const slug = 'bougie-parfumee-hb-service-760g';
  const existingProduct = await db.product.findUnique({ where: { slug } });
  
  if (existingProduct) {
    console.log('Product already exists! Updating...');
    await db.product.update({
      where: { slug },
      data: {
        description: "Offrez-vous une expérience olfactive exceptionnelle avec notre bougie parfumée grand format. Grâce à sa taille généreuse, elle parfume efficacement les grands espaces tout en apportant une touche d'élégance et de luxe à votre décoration intérieure.\n\n✔ Grande capacité de diffusion\n✔ Très longue durée de combustion\n✔ Design élégant et raffiné\n✔ Convient aux grandes pièces et événements",
        imageUrl: '/images/products/bougie-760g.jpg',
        isNew: true,
      }
    });
    
    // Check variant
    const variants = await db.productVariant.findMany({ where: { productId: existingProduct.id } });
    if (variants.length === 0) {
      await db.productVariant.create({
        data: {
          productId: existingProduct.id,
          size: '760g',
          price: 11940, // 199 DH * 60
          stock: 50,
        }
      });
    }
  } else {
    const product = await db.product.create({
      data: {
        name: 'Bougie Parfumée HB_Service - 760g',
        slug: 'bougie-parfumee-hb-service-760g',
        description: "Offrez-vous une expérience olfactive exceptionnelle avec notre bougie parfumée grand format. Grâce à sa taille généreuse, elle parfume efficacement les grands espaces tout en apportant une touche d'élégance et de luxe à votre décoration intérieure.\n\n✔ Grande capacité de diffusion\n✔ Très longue durée de combustion\n✔ Design élégant et raffiné\n✔ Convient aux grandes pièces et événements",
        imageUrl: '/images/products/bougie-760g.jpg',
        isNew: true,
        collectionId: collection.id,
        isActive: true,
        variants: {
          create: [
            {
              size: '760g',
              price: 11940, // 199 DH * 60
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
