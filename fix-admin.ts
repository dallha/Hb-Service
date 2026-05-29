import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'mrniass@gmail.com';
  console.log(`Setting ${email} as ADMIN...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found in public."User" table.`);
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`Success! User ${email} is now ADMIN. ID: ${updatedUser.id}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
