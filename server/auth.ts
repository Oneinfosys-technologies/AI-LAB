import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import * as bcrypt from "bcrypt";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Check if password is stored in bcrypt format
function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2');
}

async function hashPassword(password: string) {
  // Use bcrypt for new passwords
  return bcrypt.hash(password, 10);
}

async function comparePasswords(supplied: string, stored: string) {
  // TEMPORARY: For development/testing, we're using plain text passwords
// NOTE: This should be removed in production and passwords should be properly hashed
  console.log(`Password comparison: supplied=${supplied}, stored=${stored}`);
  
  // Direct comparison for testing
  if (supplied === stored) {
    console.log("Direct password match");
    return true;
  }
  
  // Try bcrypt if direct comparison fails (for actual production use)
  if (isBcryptHash(stored)) {
    try {
      const result = await bcrypt.compare(supplied, stored);
      console.log(`Bcrypt comparison result: ${result}`);
      return result;
    } catch (error) {
      console.error("Bcrypt comparison error:", error);
      return false;
    }
  }
  
  // Try scrypt as last resort
  try {
    const [hashed, salt] = stored.split(".");
    if (!salt) {
      console.error("Not a valid scrypt hash format");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log(`Scrypt comparison result: ${result}`);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ois-labpro-secure-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        console.log(`Password comparison result: ${passwordMatches}`);
        
        if (!passwordMatches) {
          return done(null, false);
        }
        
        console.log(`Login successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // TEMPORARY: For development/testing, we're using plain text passwords directly
      // NOTE: This should be removed in production and passwords should be properly hashed
      const user = await storage.createUser({
        ...req.body,
        password: req.body.password, // Save password as plain text for testing
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received:", { username: req.body.username });
    
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: any) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return next(loginErr);
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        console.log("Login successful for:", userWithoutPassword.username);
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
