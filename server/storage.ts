import { users, banks, utilityBills, loans, transactions, digitalWallets, type User, type InsertUser, type Bank, type InsertBank, type UtilityBill, type InsertUtilityBill, type Loan, type InsertLoan, type Transaction, type InsertTransaction, type DigitalWallet, type InsertDigitalWallet } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Bank methods
  getAllBanks(): Promise<Bank[]>;
  getBankById(id: number): Promise<Bank | undefined>;
  createBank(bank: InsertBank): Promise<Bank>;

  // Utility Bill methods
  getUserUtilityBills(userId: number): Promise<UtilityBill[]>;
  createUtilityBill(bill: InsertUtilityBill): Promise<UtilityBill>;
  updateUtilityBill(id: number, updates: Partial<UtilityBill>): Promise<UtilityBill | undefined>;

  // Loan methods
  getUserLoans(userId: number): Promise<Loan[]>;
  getLoanById(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, updates: Partial<Loan>): Promise<Loan | undefined>;

  // Transaction methods
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByLoan(loanId: number): Promise<Transaction[]>;

  // Digital Wallet methods
  getAllDigitalWallets(): Promise<DigitalWallet[]>;
  createDigitalWallet(wallet: InsertDigitalWallet): Promise<DigitalWallet>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllBanks(): Promise<Bank[]> {
    return await db.select().from(banks).where(eq(banks.isActive, true));
  }

  async getBankById(id: number): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank || undefined;
  }

  async createBank(insertBank: InsertBank): Promise<Bank> {
    const [bank] = await db
      .insert(banks)
      .values(insertBank)
      .returning();
    return bank;
  }

  async getUserUtilityBills(userId: number): Promise<UtilityBill[]> {
    return await db
      .select()
      .from(utilityBills)
      .where(eq(utilityBills.userId, userId))
      .orderBy(desc(utilityBills.uploadedAt));
  }

  async createUtilityBill(insertBill: InsertUtilityBill): Promise<UtilityBill> {
    const [bill] = await db
      .insert(utilityBills)
      .values(insertBill)
      .returning();
    return bill;
  }

  async updateUtilityBill(id: number, updates: Partial<UtilityBill>): Promise<UtilityBill | undefined> {
    const [bill] = await db
      .update(utilityBills)
      .set(updates)
      .where(eq(utilityBills.id, id))
      .returning();
    return bill || undefined;
  }

  async getUserLoans(userId: number): Promise<Loan[]> {
    return await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.appliedAt));
  }

  async getLoanById(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan || undefined;
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db
      .insert(loans)
      .values(insertLoan)
      .returning();
    return loan;
  }

  async updateLoan(id: number, updates: Partial<Loan>): Promise<Loan | undefined> {
    const [loan] = await db
      .update(loans)
      .set(updates)
      .where(eq(loans.id, id))
      .returning();
    return loan || undefined;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTransactionsByLoan(loanId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.loanId, loanId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllDigitalWallets(): Promise<DigitalWallet[]> {
    return await db.select().from(digitalWallets).where(eq(digitalWallets.isActive, true));
  }

  async createDigitalWallet(insertWallet: InsertDigitalWallet): Promise<DigitalWallet> {
    const [wallet] = await db
      .insert(digitalWallets)
      .values(insertWallet)
      .returning();
    return wallet;
  }
}

export const storage = new DatabaseStorage();
