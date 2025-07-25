const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Routes

// Get all employers
app.get('/api/employers', async (req, res) => {
  try {
    const employers = await prisma.employer.findMany({
      include: {
        employees: {
          include: {
            claims: true
          }
        }
      }
    });
    res.json(employers);
  } catch (error) {
    console.error('Error fetching employers:', error);
    res.status(500).json({ error: 'Failed to fetch employers' });
  }
});

// Create new employer
app.post('/api/employers', async (req, res) => {
  try {
    const { name, contact, fundTotal } = req.body;
    const employer = await prisma.employer.create({
      data: {
        name,
        contact,
        fundTotal: parseFloat(fundTotal)
      }
    });
    res.status(201).json(employer);
  } catch (error) {
    console.error('Error creating employer:', error);
    res.status(500).json({ error: 'Failed to create employer' });
  }
});

// Get employees for specific employer
app.get('/api/employers/:id/employees', async (req, res) => {
  try {
    const { id } = req.params;
    const employees = await prisma.employee.findMany({
      where: { employerId: id },
      include: {
        claims: true
      }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Create new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, employerId, benefitLimits } = req.body;
    const employee = await prisma.employee.create({
      data: {
        name,
        employerId,
        benefitLimits: benefitLimits || {}
      }
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Get all claims for an employee
app.get('/api/employees/:id/claims', async (req, res) => {
  try {
    const { id } = req.params;
    const claims = await prisma.claim.findMany({
      where: { employeeId: id },
      include: {
        employee: {
          include: {
            employer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Create new claim
app.post('/api/claims', async (req, res) => {
  try {
    const { employeeId, provider, category, amount, justification } = req.body;
    const claim = await prisma.claim.create({
      data: {
        employeeId,
        provider,
        category,
        amount: parseFloat(amount),
        justification,
        status: 'pending'
      },
      include: {
        employee: {
          include: {
            employer: true
          }
        }
      }
    });
    res.status(201).json(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
});

// Update claim status
app.patch('/api/claims/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const claim = await prisma.claim.update({
      where: { id },
      data: { status },
      include: {
        employee: {
          include: {
            employer: true
          }
        }
      }
    });
    res.json(claim);
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ error: 'Failed to update claim status' });
  }
});

// Dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const totalEmployers = await prisma.employer.count();
    const totalEmployees = await prisma.employee.count();
    const totalClaims = await prisma.claim.count();
    const pendingClaims = await prisma.claim.count({
      where: { status: 'pending' }
    });
    const approvedClaims = await prisma.claim.count({
      where: { status: 'approved' }
    });
    
    const totalClaimAmount = await prisma.claim.aggregate({
      _sum: { amount: true },
      where: { status: 'approved' }
    });

    res.json({
      totalEmployers,
      totalEmployees,
      totalClaims,
      pendingClaims,
      approvedClaims,
      totalPaidOut: totalClaimAmount._sum.amount || 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Employer Dashboard Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});