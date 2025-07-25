const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }),
  secret: 'employer-dashboard-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static('public'));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
};

// Authentication routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, employerId } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'employer',
        employerId
      },
      include: {
        employer: true
      }
    });
    
    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.employerId = user.employerId;
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      employer: user.employer
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employer: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.employerId = user.employerId;
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      employer: user.employer
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/user', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        employer: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      employer: user.employer
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Logout user
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Routes

// Get all employers (protected)
app.get('/api/employers', requireAuth, async (req, res) => {
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

// Create new employer (protected)
app.post('/api/employers', requireAuth, async (req, res) => {
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

// Get employees for specific employer (protected)
app.get('/api/employers/:id/employees', requireAuth, async (req, res) => {
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

// Create new employee (protected)
app.post('/api/employees', requireAuth, async (req, res) => {
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

// Get all claims for an employee (protected)
app.get('/api/employees/:id/claims', requireAuth, async (req, res) => {
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

// Create new claim (protected)
app.post('/api/claims', requireAuth, async (req, res) => {
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

// Update claim status (protected)
app.patch('/api/claims/:id/status', requireAuth, async (req, res) => {
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

// Dashboard analytics (protected)
app.get('/api/analytics/dashboard', requireAuth, async (req, res) => {
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