const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@netpulse.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@netpulse.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    },
  });

  console.log('Admin user created/updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
