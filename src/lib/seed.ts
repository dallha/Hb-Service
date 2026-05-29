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

  // ─── Products ──────────────────────────────────────────────
  const sillageDOr = await db.product.create({
    data: {
      collectionId: signature.id,
      name: 'Sillage d\'Or',
      slug: 'sillage-dor',
      description: 'Sillage d\'Or est une ode à la lumière africaine. Ce parfum captue l\'instant où le soleil couchant transforme la savane en un océan doré, un moment éphémère de grâce absolue que l\'on porte désormais sur soi.',
      notesOlfactives: JSON.stringify({
        head: ['Bergamote', 'Mandarine', 'Safran'],
        heart: ['Rose de Damas', 'Jasmin Sambac', 'Iris'],
        base: ['Ambre', 'Musc blanc', 'Bois de santal'],
      }),
      inspiration: 'Inspiré par les couchers de soleil sur les plaines du Sahel, Sillage d\'Or est né de la vision d\'un parfum qui capturerait l\'or du couchant dans un flacon, rendant éternelle cette lumière si caractéristique de l\'Afrique de l\'Ouest.',
      imageUrl: '/images/products/perfume-amber.png',
      galleryUrls: JSON.stringify([
        '/images/products/perfume-amber.png',
        '/images/brand/savoir-faire.png',
      ]),
      isActive: true,
      variants: {
        create: [
          { size: '50ml', price: 35000, stock: 25, sku: 'SGO-50' },
          { size: '100ml', price: 55000, stock: 15, sku: 'SGO-100' },
        ],
      },
    },
  });

  const oudNoir = await db.product.create({
    data: {
      collectionId: heritage.id,
      name: 'Oud Noir Intense',
      slug: 'oud-noir-intense',
      description: 'Oud Noir Intense est une immersion dans les profondeurs de la forêt primordiale. Ce parfum boisé et mystérieux enveloppe son porteur d\'une aura de puissance tranquille et de sérénité souveraine, comme les anciens rois du Sahel.',
      notesOlfactives: JSON.stringify({
        head: ['Oud', 'Poivre noir', 'Cardamome'],
        heart: ['Encens', 'Résine de benjoin', 'Ciste'],
        base: ['Musc noir', 'Bois de cèdre', 'Ambre gris'],
      }),
      inspiration: 'Puisé dans la tradition millénaire des marchés d\'encens de la Médina, Oud Noir Intense est un hommage aux marchands d\'aromates qui, depuis des siècles, font voyager les senteurs les plus précieuses à travers le continent.',
      imageUrl: '/images/products/perfume-oud.png',
      galleryUrls: JSON.stringify([
        '/images/products/perfume-oud.png',
        '/images/brand/savoir-faire.png',
      ]),
      isActive: true,
      variants: {
        create: [
          { size: '50ml', price: 45000, stock: 20, sku: 'ONI-50' },
          { size: '100ml', price: 75000, stock: 10, sku: 'ONI-100' },
        ],
      },
    },
  });

  const roseDuSahel = await db.product.create({
    data: {
      collectionId: signature.id,
      name: 'Rose du Sahel',
      slug: 'rose-du-sahel',
      description: 'Rose du Sahel célèbre la fleur qui pousse dans l\'aridité, symbole de résilience et de beauté. Un parfum floral délicat mais tenace, comme l\'amour profond qui traverse les déserts et les temps, une promesse d\'éternité.',
      notesOlfactives: JSON.stringify({
        head: ['Pêche blanche', 'Cassis', 'Bergamote'],
        heart: ['Rose de Mai', 'Pivoine', 'Muguet'],
        base: ['Musc', 'Vanille de Madagascar', 'Bois de cachemire'],
      }),
      inspiration: 'Né de l\'observation des roses sauvages qui fleurissent après la pluie dans les jardins de Saint-Louis, ce parfum est un hommage à la beauté qui naît de la patience et de la persévérance.',
      imageUrl: '/images/products/perfume-rose.png',
      galleryUrls: JSON.stringify([
        '/images/products/perfume-rose.png',
        '/images/brand/savoir-faire.png',
      ]),
      isActive: true,
      variants: {
        create: [
          { size: '50ml', price: 32000, stock: 30, sku: 'RDS-50' },
          { size: '100ml', price: 50000, stock: 18, sku: 'RDS-100' },
        ],
      },
    },
  });

  const soinCorps = await db.product.create({
    data: {
      collectionId: botanique.id,
      name: 'Beauté Corporelle',
      slug: 'beaute-corporelle',
      description: 'Un soin du corps d\'exception enrichi en beurre de karité du Sahel et en huile de baobab biologique. Sa texture fondante nourrit la peau en profondeur et laisse un voile parfumé délicat qui accompagne votre journée avec douceur.',
      notesOlfactives: JSON.stringify({
        head: ['Karité', 'Amande douce'],
        heart: ['Baobab', 'Fleur d\'oranger'],
        base: ['Vanille', 'Musc blanc'],
      }),
      inspiration: 'Les femmes du Sahel connaissent depuis des générations les vertus extraordinaires du karité et du baobab. Beauté Corporelle est née de ce savoir ancestral, sublimé par la science moderne pour offrir un soin d\'exception.',
      imageUrl: '/images/products/soin-corps.png',
      galleryUrls: JSON.stringify(['/images/products/soin-corps.png']),
      isActive: true,
      variants: {
        create: [
          { size: '200ml', price: 18000, stock: 40, sku: 'BC-200' },
          { size: '400ml', price: 28000, stock: 25, sku: 'BC-400' },
        ],
      },
    },
  });

  const brume = await db.product.create({
    data: {
      collectionId: botanique.id,
      name: 'Brume Parfumée Sérénité',
      slug: 'brume-serenite',
      description: 'Une brume légère et rafraîchissante qui enveloppe la peau et les sens d\'un voile de sérénité. Formulée avec de l\'eau de rose et de l\'aloe vera, elle hydrate et parfume délicatement tout au long de la journée.',
      notesOlfactives: JSON.stringify({
        head: ['Eau de rose', 'Aloe vera'],
        heart: ['Lavande', 'Eucalyptus'],
        base: ['Camomille', 'Musc blanc'],
      }),
      inspiration: 'Inspirée des rituels de bien-être ancestraux, cette brume parfumée est conçue comme un moment de pause dans une journée effervescente, une respiration olfactive qui invite à la sérénité.',
      imageUrl: '/images/products/brume.png',
      galleryUrls: JSON.stringify(['/images/products/brume.png']),
      isActive: true,
      variants: {
        create: [
          { size: '100ml', price: 12000, stock: 50, sku: 'BPS-100' },
          { size: '200ml', price: 18000, stock: 35, sku: 'BPS-200' },
        ],
      },
    },
  });

  const serumVisage = await db.product.create({
    data: {
      collectionId: botanique.id,
      name: 'Éclat Serum Visage',
      slug: 'eclat-serum-visage',
      description: 'Un sérum concentré en actifs naturels pour un teint lumineux et unifié. Enrichi en vitamine C naturelle et en huile d\'argan, il lutte contre les signes de l\'âge et révèle l\'éclat de votre peau jour après jour.',
      notesOlfactives: JSON.stringify({
        head: ['Argan', 'Citron'],
        heart: ['Rose', 'Géranium'],
        base: ['Jojoba', 'Avocat'],
      }),
      inspiration: 'L\'huile d\'argan, or liquide du Maroc, est au cœur de ce sérum innovant. Associée à la vitamine C naturelle, elle offre une synergie parfaite pour révéler l\'éclat naturel de chaque peau.',
      imageUrl: '/images/products/serum.png',
      galleryUrls: JSON.stringify(['/images/products/serum.png']),
      isActive: true,
      variants: {
        create: [
          { size: '30ml', price: 22000, stock: 35, sku: 'ESV-30' },
        ],
      },
    },
  });

  // ─── Set Related Ritual IDs ────────────────────────────────
  // Sillage d'Or → Brume Sérénité + Beauté Corporelle
  await db.product.update({
    where: { id: sillageDOr.id },
    data: { relatedRitualIds: JSON.stringify([brume.id, soinCorps.id]) },
  });

  // Oud Noir → Beauté Corporelle
  await db.product.update({
    where: { id: oudNoir.id },
    data: { relatedRitualIds: JSON.stringify([soinCorps.id, brume.id]) },
  });

  // Rose du Sahel → Brume Sérénité + Sérum Visage
  await db.product.update({
    where: { id: roseDuSahel.id },
    data: { relatedRitualIds: JSON.stringify([brume.id, serumVisage.id]) },
  });

  // ─── Sample Reviews ────────────────────────────────────────
  await db.review.createMany({
    data: [
      { productId: sillageDOr.id, userName: 'Aminata D.', rating: 5, comment: 'Un parfum qui me transporte à chaque vaporisation. La tenue est exceptionnelle, les notes de safran sont sublimes. Je reçois des compliments à chaque fois.', isVerified: true },
      { productId: sillageDOr.id, userName: 'Ousmane B.', rating: 5, comment: 'Sillage d\'Or est devenu mon signature. Élégant sans être ostentatoire, il est parfait pour toutes les occasions. Un vrai coup de cœur.', isVerified: true },
      { productId: oudNoir.id, userName: 'Fatou S.', rating: 5, comment: 'L\'Oud Noir Intense est tout simplement envoûtant. La profondeur des notes boisées est incomparable. Un parfum de caractère pour les connaisseurs.', isVerified: true },
      { productId: oudNoir.id, userName: 'Mamadou K.', rating: 4, comment: 'Très belle fragrance oud, puissante mais élégante. Je recommande particulièrement la version 100ml pour une meilleure diffusion.', isVerified: true },
      { productId: roseDuSahel.id, userName: 'Mariam T.', rating: 5, comment: 'La Rose du Sahel est d\'une délicatesse rare. Les notes florales sont parfaitement équilibrées, et la vanille de Madagascar en base est un pur bonheur.', isVerified: true },
      { productId: soinCorps.id, userName: 'Aïcha M.', rating: 5, comment: 'Ma peau n\'a jamais été aussi douce. Le beurre de karité fait des merveilles et le parfum est subtil et envoûtant. Un indispensable.', isVerified: true },
      { productId: brume.id, userName: 'Djenaba C.', rating: 4, comment: 'Parfaite pour se rafraîchir en journée. L\'eau de rose est apaisante et le parfum reste délicat. J\'adore l\'utiliser après le sport.', isVerified: true },
      { productId: serumVisage.id, userName: 'Sokhna N.', rating: 5, comment: 'Après deux semaines d\'utilisation, mon teint est visiblement plus lumineux. Le sérum pénètre rapidement et ne laisse pas de film gras. Je recommande vivement.', isVerified: true },
    ],
  });

  // ─── Sample Orders for Dashboard ───────────────────────────
  const sampleUser = await db.user.create({
    data: {
      email: 'client@example.com',
      fullName: 'Client Test',
      phone: '+221 77 123 45 67',
    },
  });

  // Fetch variants for sample orders
  const sillageDOrVariants = await db.productVariant.findMany({
    where: { product: { slug: 'sillage-dor' } },
  });
  const brumeVariants = await db.productVariant.findMany({
    where: { product: { slug: 'brume-serinite' } },
  });

  const order1 = await db.order.create({
    data: {
      userId: sampleUser.id,
      totalAmount: 55000,
      status: 'delivered',
      items: {
        create: [
          { variantId: sillageDOrVariants[0]?.id || '', quantity: 1, unitPrice: 35000 },
          { variantId: brumeVariants[0]?.id || '', quantity: 1, unitPrice: 12000 },
        ],
      },
    },
  });

  await db.payment.create({
    data: {
      orderId: order1.id,
      provider: 'wave',
      status: 'completed',
      reference: 'WAV-TEST-001',
    },
  });

  console.log('✅ Database seeded successfully');
}
