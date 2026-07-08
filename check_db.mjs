import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { name: true, images: true } });
  console.log(JSON.stringify(products, null, 2));
}
main().finally(() => prisma.$disconnect());
