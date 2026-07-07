import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, imageUrl: true } })
  console.log("Products images:", products.slice(0, 10))
  const collections = await prisma.collection.findMany({ select: { id: true, imageUrl: true } })
  console.log("Collections images:", collections.slice(0, 10))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
