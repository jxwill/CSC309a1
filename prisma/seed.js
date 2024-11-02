// prisma/seed.js
const prisma = require('@prisma/client').PrismaClient;
const bcrypt = require('bcrypt');

const prismaClient = new prisma();

async function main() {
  const adminEmail = 'example@admin.com';
  const adminPassword = 'password'; // Use a strong password and document it

  const existingAdmin = await prismaClient.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prismaClient.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log(`Admin user created with email: ${adminEmail}`);
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
