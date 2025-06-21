import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { insertUserSchema, loginSchema, insertLoanSchema, insertUtilityBillSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data
  await initializeDefaultData();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({
        user: { ...user, password: undefined },
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        user: { ...user, password: undefined },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Protected routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      delete updates.password; // Don't allow password updates through this route
      
      const user = await storage.updateUser(req.user.userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Banks routes
  app.get("/api/banks", async (req, res) => {
    try {
      const banks = await storage.getAllBanks();
      res.json(banks);
    } catch (error) {
      console.error("Banks fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Utility bills routes
  app.get("/api/utility-bills", authenticateToken, async (req: any, res) => {
    try {
      const bills = await storage.getUserUtilityBills(req.user.userId);
      res.json(bills);
    } catch (error) {
      console.error("Bills fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/utility-bills", authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      const { billType, amount, dueDate, paymentStatus } = req.body;
      
      const billData = {
        userId: req.user.userId,
        billType,
        amount,
        dueDate: new Date(dueDate),
        paymentStatus: paymentStatus || 'pending',
        fileName: req.file?.originalname,
        filePath: req.file?.path,
      };

      const bill = await storage.createUtilityBill(billData);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Bill upload error:", error);
      res.status(400).json({ message: "Invalid bill data" });
    }
  });

  // Loans routes
  app.get("/api/loans", authenticateToken, async (req: any, res) => {
    try {
      const loans = await storage.getUserLoans(req.user.userId);
      res.json(loans);
    } catch (error) {
      console.error("Loans fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/loans", authenticateToken, async (req: any, res) => {
    try {
      const loanData = {
        ...req.body,
        userId: req.user.userId,
        applicationId: `LN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      };

      // Simulate ML model processing
      const approvalScore = Math.floor(Math.random() * 40) + 60; // 60-100%
      const isApproved = approvalScore >= 70;
      
      if (isApproved) {
        loanData.sanctionedAmount = Math.floor(loanData.requestedAmount * 0.75); // 75% of requested
        loanData.status = 'approved';
        loanData.approvalScore = approvalScore;
        loanData.monthlyEmi = calculateEMI(loanData.sanctionedAmount, loanData.interestRate, loanData.tenure);
        loanData.totalInterest = (loanData.monthlyEmi * loanData.tenure) - loanData.sanctionedAmount;
        loanData.processingFee = loanData.sanctionedAmount * 0.01; // 1% processing fee
        loanData.approvedAt = new Date();
      } else {
        loanData.status = 'rejected';
        loanData.approvalScore = approvalScore;
      }

      const loan = await storage.createLoan(loanData);
      res.status(201).json(loan);
    } catch (error) {
      console.error("Loan application error:", error);
      res.status(400).json({ message: "Invalid loan data" });
    }
  });

  app.patch("/api/loans/:id", authenticateToken, async (req: any, res) => {
    try {
      const loanId = parseInt(req.params.id);
      const updates = req.body;
      
      const loan = await storage.updateLoan(loanId, updates);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error) {
      console.error("Loan update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.userId);
      res.json(transactions);
    } catch (error) {
      console.error("Transactions fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const transactionData = {
        ...req.body,
        userId: req.user.userId,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      };

      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Digital wallets routes
  app.get("/api/digital-wallets", async (req, res) => {
    try {
      const wallets = await storage.getAllDigitalWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Wallets fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
}

async function initializeDefaultData() {
  try {
    // Initialize banks
    const banks = [
      { name: "State Bank of India", code: "SBI", logoUrl: "", isActive: true },
      { name: "HDFC Bank", code: "HDFC", logoUrl: "", isActive: true },
      { name: "ICICI Bank", code: "ICICI", logoUrl: "", isActive: true },
      { name: "Axis Bank", code: "AXIS", logoUrl: "", isActive: true },
      { name: "Punjab National Bank", code: "PNB", logoUrl: "", isActive: true },
      { name: "Central Bank of India", code: "CBI", logoUrl: "", isActive: true },
    ];

    for (const bank of banks) {
      try {
        await storage.createBank(bank);
      } catch (error) {
        // Bank might already exist
      }
    }

    // Initialize digital wallets
    const wallets = [
      { name: "Google Pay", code: "GPAY", iconClass: "fab fa-google-pay", isActive: true },
      { name: "PhonePe", code: "PHONEPE", iconClass: "fas fa-mobile-alt", isActive: true },
      { name: "BHIM UPI", code: "BHIM", iconClass: "fas fa-university", isActive: true },
      { name: "Razorpay", code: "RAZORPAY", iconClass: "fas fa-credit-card", isActive: true },
      { name: "PayPal", code: "PAYPAL", iconClass: "fab fa-paypal", isActive: true },
    ];

    for (const wallet of wallets) {
      try {
        await storage.createDigitalWallet(wallet);
      } catch (error) {
        // Wallet might already exist
      }
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
