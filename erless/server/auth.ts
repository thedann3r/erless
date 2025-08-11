import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "erlessed-healthcare-session-secret-2025";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: storage.sessionStore,
    name: 'connect.sid',
    rolling: false,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' as const,
      path: '/',
      domain: undefined // Let browser handle domain
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (emailOrUsername, password, done) => {
      try {
        console.log(`Login attempt for: ${emailOrUsername}`);
        let user;
        
        // Check if input contains @ symbol to determine if it's email or username
        if (emailOrUsername.includes('@')) {
          console.log('Attempting email login');
          user = await storage.getUserByEmail(emailOrUsername);
        } else {
          console.log('Attempting username login');
          user = await storage.getUserByUsername(emailOrUsername);
        }
        
        if (!user) {
          console.log('User not found');
          return done(null, false, { message: 'User not found' });
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          console.log('Password mismatch');
          return done(null, false, { message: 'Invalid password' });
        }
        
        console.log('Login successful for user:', user.username);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializing user ID:', id, typeof id);
      const userId = typeof id === 'string' ? parseInt(id, 10) : id;
      console.log('Parsed user ID:', userId);
      
      if (!userId || isNaN(userId)) {
        console.log('Invalid user ID during deserialization:', id);
        return done(null, false);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('User not found during deserialization for ID:', userId);
        return done(null, false);
      }
      console.log('User deserialized successfully:', user.username);
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Authentication failed" });
      }
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email/username or password" 
        });
      }
      
      req.login(user, async (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ message: "Login failed" });
        }
        
        console.log("Session after login:", (req.session as any).passport);
        
        // Update last login time
        try {
          await storage.updateLastLogin(user.id);
        } catch (error) {
          console.error("Failed to update last login:", error);
        }
        
        // Force session save and then send response
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Session save failed" });
          }
          
          console.log("Session saved successfully");
          
          // Set session indicator cookie for frontend
          res.cookie('auth-status', 'authenticated', {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          });
          
          res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("User request - Session ID:", req.sessionID);
    console.log("User request - Session passport:", req.session?.passport);
    console.log("User request - isAuthenticated:", req.isAuthenticated());
    console.log("User request - user:", req.user?.username);
    console.log("User request - Session store:", !!req.session);
    
    if (!req.isAuthenticated() || !req.user) {
      console.log("User not authenticated");
      return res.sendStatus(401);
    }
    
    // Ensure user object has all required fields for debtors
    const user = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      department: req.user.department,
      premiumAccess: req.user.role === 'debtors' ? true : req.user.premiumAccess
    };
    
    res.json(user);
  });
}
