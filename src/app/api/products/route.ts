import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collection');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('all') === 'true';

    // Validate search parameter length to prevent ReDoS
    if (search && search.length > 200) {
      return NextResponse.json(
        { error: 'Le terme de recherche est trop long (max 200 caractères)' },
        { status: 400 }
      );
    }

    const products = await db.product.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(collectionSlug && {
          collection: { slug: collectionSlug },
        }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: {
        collection: true,
        variants: true,
        reviews: {
          where: { isVerified: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute average rating
    const productsWithRating = products.map((p) => ({
      ...p,
      averageRating: p.reviews.length > 0 
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length 
        : 0,
      reviewCount: p.reviews.length,
    }));

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      brand,
      name,
      slug,
      description,
      notesOlfactives,
      inspiration,
      imageUrl,
      galleryUrls,
      relatedRitualIds,
      gender,
      isNew,
      sourcePage,
      arabicName,
      lineEquivalent,
      catalogOrder,
      isActive,
      collectionId,
      variants,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom du produit est requis' }, { status: 400 });
    }
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'Le slug du produit est requis' }, { status: 400 });
    }
    if (!collectionId || typeof collectionId !== 'string') {
      return NextResponse.json({ error: 'La collection est requise' }, { status: 400 });
    }

    // Validate slug format (alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets' },
        { status: 400 }
      );
    }

    // Validate variants if provided
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (!v.size || typeof v.size !== 'string') {
          return NextResponse.json({ error: 'Chaque variante doit avoir une taille' }, { status: 400 });
        }
        if (typeof v.price !== 'number' || v.price < 0) {
          return NextResponse.json({ error: 'Le prix doit être un nombre positif ou nul' }, { status: 400 });
        }
        if (v.compareAtPrice !== undefined && v.compareAtPrice !== null && v.compareAtPrice !== '') {
          const cap = Number(v.compareAtPrice);
          if (isNaN(cap) || cap <= 0) {
            return NextResponse.json({ error: 'Le prix barré doit être un nombre positif' }, { status: 400 });
          }
        }
        if (typeof v.stock !== 'number' || v.stock < 0) {
          return NextResponse.json({ error: 'Le stock doit être un nombre positif ou nul' }, { status: 400 });
        }
      }
    }

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Un produit avec ce slug existe déjà' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        brand: brand || null,
        description: description || null,
        notesOlfactives: notesOlfactives || null,
        inspiration: inspiration || null,
        imageUrl: imageUrl || null,
        galleryUrls: galleryUrls || null,
        relatedRitualIds: relatedRitualIds || null,
        gender: gender || null,
        isNew: typeof isNew === 'boolean' ? isNew : false,
        sourcePage: typeof sourcePage === 'number' ? sourcePage : null,
        arabicName: arabicName || null,
        lineEquivalent: lineEquivalent || null,
        catalogOrder: typeof catalogOrder === 'number' ? catalogOrder : null,
        isActive: isActive !== undefined ? isActive : true,
        collectionId,
        variants: {
          create: (variants || []).map((v: any) => ({
            size: v.size,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice && v.compareAtPrice !== '' ? Number(v.compareAtPrice) : null,
            stock: Number(v.stock),
            sku: v.sku || null,
          })),
        },
      },
      include: {
        collection: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, variants, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Validate id format
    if (typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (!v.size || typeof v.size !== 'string') {
          return NextResponse.json({ error: 'Chaque variante doit avoir une taille' }, { status: 400 });
        }
        if (typeof v.price !== 'number' || v.price < 0) {
          return NextResponse.json({ error: 'Le prix doit être un nombre positif ou nul' }, { status: 400 });
        }
        if (v.compareAtPrice !== undefined && v.compareAtPrice !== null && v.compareAtPrice !== '') {
          const cap = Number(v.compareAtPrice);
          if (isNaN(cap) || cap <= 0) {
            return NextResponse.json({ error: 'Le prix barré doit être un nombre positif' }, { status: 400 });
          }
        }
        if (typeof v.stock !== 'number' || v.stock < 0) {
          return NextResponse.json({ error: 'Le stock doit être un nombre positif ou nul' }, { status: 400 });
        }
      }
 
      // Delete existing variants and recreate
      await db.productVariant.deleteMany({ where: { productId: id } });
      await db.productVariant.createMany({
        data: variants.map((v: any) => ({
          size: v.size,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice && v.compareAtPrice !== '' ? Number(v.compareAtPrice) : null,
          stock: Number(v.stock),
          sku: v.sku || null,
          productId: id,
        })),
      });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(data.brand !== undefined ? { brand: data.brand || null } : {}),
        ...data,
        ...(data.gender !== undefined ? { gender: data.gender || null } : {}),
        ...(data.isNew !== undefined ? { isNew: Boolean(data.isNew) } : {}),
        ...(data.sourcePage !== undefined
          ? { sourcePage: data.sourcePage === null ? null : Number(data.sourcePage) }
          : {}),
        ...(data.arabicName !== undefined ? { arabicName: data.arabicName || null } : {}),
        ...(data.lineEquivalent !== undefined ? { lineEquivalent: data.lineEquivalent || null } : {}),
        ...(data.catalogOrder !== undefined
          ? { catalogOrder: data.catalogOrder === null ? null : Number(data.catalogOrder) }
          : {}),
        notesOlfactives: data.notesOlfactives || undefined,
        inspiration: data.inspiration || undefined,
        imageUrl: data.imageUrl || undefined,
        galleryUrls: data.galleryUrls || undefined,
        relatedRitualIds: data.relatedRitualIds || undefined,
      },
      include: {
        collection: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Validate id format
    if (typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'ID de produit invalide' }, { status: 400 });
    }

    // Delete variants first (cascade)
    await db.productVariant.deleteMany({ where: { productId: id } });
    await db.review.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
