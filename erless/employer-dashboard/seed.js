const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding employer dashboard database...');

  // Clear existing data
  await prisma.claim.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.employer.deleteMany({});

  // Create sample employers
  const employer1 = await prisma.employer.create({
    data: {
      name: 'TechCorp Ltd',
      contact: 'hr@techcorp.com',
      fundTotal: 500000.00,
    },
  });

  const employer2 = await prisma.employer.create({
    data: {
      name: 'HealthPlus Solutions',
      contact: 'benefits@healthplus.co.ke',
      fundTotal: 750000.00,
    },
  });

  // Create sample employees for TechCorp
  const employee1 = await prisma.employee.create({
    data: {
      name: 'John Kamau',
      employerId: employer1.id,
      benefitLimits: {
        medical: 100000,
        dental: 20000,
        vision: 15000,
        wellness: 10000
      },
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      name: 'Sarah Wanjiku',
      employerId: employer1.id,
      benefitLimits: {
        medical: 150000,
        dental: 25000,
        vision: 20000,
        wellness: 15000
      },
    },
  });

  // Create sample employees for HealthPlus
  const employee3 = await prisma.employee.create({
    data: {
      name: 'David Kiprotich',
      employerId: employer2.id,
      benefitLimits: {
        medical: 200000,
        dental: 30000,
        vision: 25000,
        wellness: 20000
      },
    },
  });

  // Create sample claims
  const claim1 = await prisma.claim.create({
    data: {
      employeeId: employee1.id,
      provider: 'Nairobi Hospital',
      category: 'medical',
      amount: 15000.00,
      status: 'approved',
      justification: 'Annual checkup and blood tests',
    },
  });

  const claim2 = await prisma.claim.create({
    data: {
      employeeId: employee1.id,
      provider: 'SmileCare Dental',
      category: 'dental',
      amount: 8500.00,
      status: 'pending',
      justification: 'Dental cleaning and cavity filling',
    },
  });

  const claim3 = await prisma.claim.create({
    data: {
      employeeId: employee2.id,
      provider: 'Vision Plus Opticals',
      category: 'vision',
      amount: 12000.00,
      status: 'approved',
      justification: 'Prescription glasses and eye exam',
    },
  });

  const claim4 = await prisma.claim.create({
    data: {
      employeeId: employee3.id,
      provider: 'Fitness First Gym',
      category: 'wellness',
      amount: 5000.00,
      status: 'pending',
      justification: 'Annual gym membership for wellness program',
    },
  });

  // Create demo users
  const hashedPassword1 = await bcrypt.hash('demo123', 10);
  const hashedPassword2 = await bcrypt.hash('admin123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'hr@techcorp.com',
      password: hashedPassword1,
      role: 'employer',
      employerId: employer1.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'admin@benefits.com',
      password: hashedPassword2,
      role: 'admin',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created: 2 employers, 3 employees, 4 claims, 2 users`);
  console.log(`🔐 Demo accounts:`);
  console.log(`   Employer: hr@techcorp.com / demo123`);
  console.log(`   Admin: admin@benefits.com / admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });