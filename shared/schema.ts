import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  selectedBankId: integer("selected_bank_id"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("75000"),
  usedCredit: decimal("used_credit", { precision: 12, scale: 2 }).default("40000"),
  creditScore: integer("credit_score").default(785),
  createdAt: timestamp("created_at").defaultNow(),
});

export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
});

export const utilityBills = pgTable("utility_bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  billType: varchar("bill_type", { length: 50 }).notNull(), // 'power', 'water', 'gas'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // 'paid', 'pending', 'overdue'
  fileName: text("file_name"),
  filePath: text("file_path"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bankId: integer("bank_id").notNull().references(() => banks.id),
  applicationId: text("application_id").notNull().unique(),
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  sanctionedAmount: decimal("sanctioned_amount", { precision: 12, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(), // in months
  monthlyEmi: decimal("monthly_emi", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected', 'disbursed'
  approvalScore: integer("approval_score"),
  processingFee: decimal("processing_fee", { precision: 8, scale: 2 }),
  totalInterest: decimal("total_interest", { precision: 12, scale: 2 }),
  appliedAt: timestamp("applied_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loanId: integer("loan_id").references(() => loans.id),
  transactionId: text("transaction_id").notNull().unique(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'EMI', 'Bill Payment', 'Loan Disbursal', 'Processing Fee'
  status: varchar("status", { length: 20 }).default("pending"), // 'completed', 'pending', 'failed'
  paymentMethod: varchar("payment_method", { length: 50 }), // 'Google Pay', 'PhonePe', 'BHIM UPI', etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const digitalWallets = pgTable("digital_wallets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  iconClass: text("icon_class"),
  isActive: boolean("is_active").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  utilityBills: many(utilityBills),
  loans: many(loans),
  transactions: many(transactions),
  selectedBank: one(banks, {
    fields: [users.selectedBankId],
    references: [banks.id],
  }),
}));

export const banksRelations = relations(banks, ({ many }) => ({
  loans: many(loans),
  users: many(users),
}));

export const utilityBillsRelations = relations(utilityBills, ({ one }) => ({
  user: one(users, {
    fields: [utilityBills.userId],
    references: [users.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  bank: one(banks, {
    fields: [loans.bankId],
    references: [banks.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  loan: one(loans, {
    fields: [transactions.loanId],
    references: [loans.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBankSchema = createInsertSchema(banks).omit({
  id: true,
});

export const insertUtilityBillSchema = createInsertSchema(utilityBills).omit({
  id: true,
  uploadedAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  appliedAt: true,
  approvedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertDigitalWalletSchema = createInsertSchema(digitalWallets).omit({
  id: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBank = z.infer<typeof insertBankSchema>;
export type Bank = typeof banks.$inferSelect;
export type InsertUtilityBill = z.infer<typeof insertUtilityBillSchema>;
export type UtilityBill = typeof utilityBills.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertDigitalWallet = z.infer<typeof insertDigitalWalletSchema>;
export type DigitalWallet = typeof digitalWallets.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
