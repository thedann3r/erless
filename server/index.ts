import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { createClient } from "redis";
import { RedisStore } from "rate-limit-redis";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectMongoDB } from "./mongodb";

const app = express();

// Trust proxy headers for production deployment
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://erlessed.fly.dev', 'https://erlessed.onrender.com']
    : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression for better performance
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

// Redis client for rate limiting
let redisClient: any = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.connect().catch((err: any) => {
      console.warn('Redis connection failed:', err.message);
    });
  } catch (error) {
    console.warn('Redis client creation failed, using memory store for rate limiting');
  }
}

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }) : undefined,
  skip: (req) => req.path === '/health' || req.path === '/metrics'
});

// Stricter rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }) : undefined
});

app.use(limiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Apply auth rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Health check endpoint - must come before other middleware
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Database health check
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    
    try {
      const startTime = Date.now();
      const { db } = await import('./db');
      await db.execute('SELECT 1');
      dbResponseTime = Date.now() - startTime;
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = 'disconnected';
      console.error('Database health check failed:', dbError);
    }

    const healthCheck = {
      status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`
      },
      redis: {
        status: redisClient?.isReady ? 'connected' : 'not_configured'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      services: {
        main_app: 'healthy',
        hms_integration: process.env.NODE_ENV === 'production' ? 'configured' : 'development'
      }
    };
    
    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Metrics endpoint for Prometheus/monitoring
app.get('/metrics', (req: Request, res: Response) => {
  const metrics = {
    nodejs_heap_size_used_bytes: process.memoryUsage().heapUsed,
    nodejs_heap_size_total_bytes: process.memoryUsage().heapTotal,
    nodejs_external_memory_bytes: process.memoryUsage().external,
    nodejs_rss_bytes: process.memoryUsage().rss,
    process_uptime_seconds: process.uptime(),
    process_start_time_seconds: Math.floor(Date.now() / 1000 - process.uptime()),
    erlessed_active_connections: 0, // TODO: Track actual connections
    erlessed_requests_total: 0 // TODO: Track total requests
  };
  
  // Prometheus format
  let output = '';
  for (const [key, value] of Object.entries(metrics)) {
    output += `# TYPE ${key} gauge\n`;
    output += `${key} ${value}\n`;
  }
  
  res.set('Content-Type', 'text/plain');
  res.send(output);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize MongoDB for biometric data (non-blocking)
  connectMongoDB().then(() => {
    log('MongoDB connected successfully for biometric storage');
  }).catch((error) => {
    log('MongoDB connection failed - biometric features will be unavailable');
    console.error('MongoDB Error:', error);
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000');
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`environment: ${process.env.NODE_ENV || 'development'}`);
    log(`health check: http://localhost:${port}/health`);
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    log(`${signal} received, shutting down gracefully`);
    server.close(() => {
      log('HTTP server closed');
      if (redisClient) {
        redisClient.quit().then(() => {
          log('Redis connection closed');
          process.exit(0);
        }).catch(() => {
          process.exit(1);
        });
      } else {
        process.exit(0);
      }
    });

    // Force close after 30 seconds
    setTimeout(() => {
      log('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error.message}`);
    console.error(error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    console.error(reason);
  });
})();
