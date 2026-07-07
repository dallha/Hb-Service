import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.siteSettings.findMany()
  console.log("SiteSettings:", settings)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
