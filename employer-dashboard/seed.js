const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding employer dashboard database...');

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

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created: 2 employers, 3 employees, 4 claims`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });