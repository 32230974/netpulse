# 🌐 NetPulse — Smart ISP Management System

> AI-powered Internet Service Provider management platform built with Next.js 16, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma 7, and OpenAI.

---

## ✨ Features

### 🔐 Authentication & Authorization
- NextAuth v5 with Credentials provider
- JWT-based sessions with role-based access
- Three roles: **Admin**, **Employee**, **Customer**
- Route protection via Edge-compatible middleware

### 👥 Customer Management
- Full CRUD operations (add, edit, delete)
- Searchable & filterable customer table with pagination
- Detailed customer profiles with subscription history
- Customer risk score analytics

### 📦 Subscription System
- Three plans: Basic ($29), Standard ($49), Premium ($99)
- Auto-renewal tracking
- Subscription lifecycle management

### 💰 Billing & Invoicing
- Invoice generation and management
- Mark paid/unpaid with payment record tracking
- Revenue dashboard with trend charts
- Tax calculation

### 🎫 Support Ticket System
- Create tickets with priority levels (Low → Urgent)
- Conversation threading
- Status workflow: Open → In Progress → Closed
- AI-powered response suggestions

### 🤖 AI Intelligence
- **AI Chatbot** — Context-aware assistant with customer data
- **Churn Prediction** — Risk scoring (0-100) with contributing factors
- **Business Insights** — Revenue forecasts, growth opportunities
- **Auto-Suggestions** — AI generates ticket response templates

### 📊 Dashboard
- Real-time KPI cards
- Revenue trend charts (Recharts)
- Churn risk distribution
- Plan analytics

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Beta) |
| AI | OpenAI API (GPT-4o-mini) |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone & Install
```bash
git clone <repo-url>
cd netpulse
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 3. Setup Database
```bash
npx prisma db push     # Create tables
npx prisma db seed     # Populate demo data
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@netpulse.com | password123 |
| Employee | employee@netpulse.com | password123 |
| Customer | customer@netpulse.com | password123 |

---

## 📁 Project Structure

```
netpulse/
├── prisma/
│   ├── schema.prisma         # Database schema (11 models)
│   └── seed.ts               # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login & Register pages
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   ├── dashboard/    # Admin KPI dashboard
│   │   │   ├── customers/    # Customer CRUD + profiles
│   │   │   ├── billing/      # Invoice management
│   │   │   ├── tickets/      # Support ticket system
│   │   │   ├── ai-insights/  # AI analytics
│   │   │   ├── subscriptions/# Plan management
│   │   │   └── settings/     # User preferences
│   │   ├── api/              # REST API routes
│   │   │   ├── ai/           # Chat, Churn, Insights, Suggest
│   │   │   ├── auth/         # NextAuth + Register
│   │   │   ├── customers/    # Customer CRUD
│   │   │   ├── invoices/     # Invoice management
│   │   │   ├── subscriptions/# Subscription API
│   │   │   ├── tickets/      # Ticket + Messages API
│   │   │   └── dashboard/    # Stats aggregation
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities & services
│   │   ├── ai/openai.ts      # OpenAI client + fallbacks
│   │   ├── prisma.ts         # Database client
│   │   └── utils.ts          # Formatting helpers
│   ├── auth.ts               # NextAuth configuration
│   └── middleware.ts         # Route protection
└── package.json
```

---

## 📄 License

MIT License — Built as a graduation project.
