import { MetadataRoute } from 'next'
import { db as prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Fetch all collections
  const collections = await prisma.collection.findMany({
    select: { slug: true, updatedAt: true }
  })

  // Fetch all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  })

  // Static routes
  const routes = [
    '',
    '/about',
    '/shop',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic collections routes
  const collectionsRoutes = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: collection.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Dynamic products routes
  const productsRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...routes, ...collectionsRoutes, ...productsRoutes]
}
