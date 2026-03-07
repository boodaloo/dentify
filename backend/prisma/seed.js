const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('orisios123', 10);
  
  const clinic = await prisma.clinic.upsert({
    where: { id: 'default-clinic-id' },
    update: {},
    create: {
      id: 'default-clinic-id',
      name: 'Orisios Clinic',
      address: 'Moscow, Russia',
      phone: '+7 999 000-00-00',
    },
  });

  const branch = await prisma.branch.upsert({
    where: { id: 'default-branch-id' },
    update: {},
    create: {
      id: 'default-branch-id',
      clinicId: clinic.id,
      name: 'Central Branch',
      shortCode: 'CEN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'doctor@orisios.com' },
    update: { password },
    create: {
      email: 'doctor@orisios.com',
      password,
      name: 'Dr. John Doe',
      role: 'ADMIN',
      clinicId: clinic.id,
    },
  });

  console.log('Seeding finished.');
  console.log('User created: doctor@orisios.com / orisios123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
