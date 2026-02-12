const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'nakanowatari@seo-director.com' }
  });
  console.log(user);
  await prisma.$disconnect();
}

checkUser();
