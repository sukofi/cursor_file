const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const user = await prisma.user.update({
    where: { email: 'nakanowatari@seo-director.com' },
    data: { plan: 'pro' }
  });
  console.log('User upgraded to Pro:', user);
  await prisma.$disconnect();
}

makeAdmin();
