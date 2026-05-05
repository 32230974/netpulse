-- ============================================
-- NetPulse Supabase Database Schema
-- PostgreSQL DDL for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER TABLE
-- ============================================
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'CUSTOMER',
  image TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "User_role_idx" ON "User"(role);

-- ============================================
-- CUSTOMER TABLE
-- ============================================
CREATE TABLE "Customer" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Customer_status_idx" ON "Customer"(status);
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");

-- ============================================
-- PLAN TABLE
-- ============================================
CREATE TABLE "Plan" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  speed TEXT NOT NULL,
  features TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- ============================================
-- SUBSCRIPTION TABLE
-- ============================================
CREATE TABLE "Subscription" (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "autoRenew" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE,
  FOREIGN KEY ("planId") REFERENCES "Plan"(id)
);

CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"(status);
CREATE INDEX "Subscription_endDate_idx" ON "Subscription"("endDate");

-- ============================================
-- INVOICE TABLE
-- ============================================
CREATE TABLE "Invoice" (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'UNPAID',
  "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE
);

CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"(status);
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- ============================================
-- PAYMENT TABLE
-- ============================================
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY,
  "invoiceId" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT DEFAULT 'card',
  "transactionId" TEXT,
  "paidAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id) ON DELETE CASCADE
);

CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- ============================================
-- TICKET TABLE
-- ============================================
CREATE TABLE "Ticket" (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  priority TEXT DEFAULT 'MEDIUM',
  "creatorId" TEXT NOT NULL,
  "assignedTo" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("creatorId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Ticket_creatorId_idx" ON "Ticket"("creatorId");
CREATE INDEX "Ticket_status_idx" ON "Ticket"(status);
CREATE INDEX "Ticket_priority_idx" ON "Ticket"(priority);

-- ============================================
-- TICKET MESSAGE TABLE
-- ============================================
CREATE TABLE "TicketMessage" (
  id TEXT PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  content TEXT NOT NULL,
  "isAiGenerated" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE,
  FOREIGN KEY ("senderId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");

-- ============================================
-- CHAT MESSAGE TABLE
-- ============================================
CREATE TABLE "ChatMessage" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- ============================================
-- AI INSIGHT TABLE
-- ============================================
CREATE TABLE "AIInsight" (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AIInsight_type_idx" ON "AIInsight"(type);

-- ============================================
-- RISK SCORE TABLE
-- ============================================
CREATE TABLE "RiskScore" (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  factors TEXT NOT NULL,
  "calculatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE
);

CREATE INDEX "RiskScore_customerId_idx" ON "RiskScore"("customerId");
CREATE INDEX "RiskScore_level_idx" ON "RiskScore"(level);

-- ============================================
-- NOTIFICATION TABLE
-- ============================================
CREATE TABLE "Notification" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- ============================================
-- CONSTRAINTS & COMMENTS
-- ============================================

COMMENT ON TABLE "User" IS 'System users with roles: ADMIN, EMPLOYEE, CUSTOMER';
COMMENT ON TABLE "Customer" IS 'Customer profiles linked to user accounts';
COMMENT ON TABLE "Plan" IS 'Subscription plans: Basic ($29), Standard ($49), Premium ($99)';
COMMENT ON TABLE "Subscription" IS 'Active customer subscriptions with auto-renewal tracking';
COMMENT ON TABLE "Invoice" IS 'Billing invoices for customers';
COMMENT ON TABLE "Payment" IS 'Payment records for invoices';
COMMENT ON TABLE "Ticket" IS 'Support tickets with priority levels';
COMMENT ON TABLE "TicketMessage" IS 'Conversation messages in support tickets';
COMMENT ON TABLE "ChatMessage" IS 'AI chatbot conversation history';
COMMENT ON TABLE "AIInsight" IS 'Generated business insights (revenue, churn, growth, recommendations)';
COMMENT ON TABLE "RiskScore" IS 'Churn prediction risk scores (0-100) with contributing factors';
COMMENT ON TABLE "Notification" IS 'User notifications and alerts';
