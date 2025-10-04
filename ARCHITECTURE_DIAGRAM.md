# Architecture Diagram

## Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  Components: dashboard, add-expense-dialog, budget-setup    │
│  MobX Stores: userStore, expensesStore, budgetStore         │
│                                                              │
│  Responsibility: UI rendering, user interactions             │
│  Can call: Utils/API Helpers ONLY                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ import { createExpense } from '@/utils/api-helpers'
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  UTILS/API HELPERS LAYER                    │
│  Files: utils/api-helpers/expense.ts                        │
│         utils/api-helpers/budget.ts                         │
│                                                              │
│  Responsibility: Client-side API calls, error handling       │
│  Can call: API Endpoints via fetch ONLY                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ fetch('/api/expenses/new', { method: 'POST' })
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   API ENDPOINTS LAYER                        │
│  Files: app/api/expenses/new/route.ts                       │
│         app/api/expenses/new/[id]/route.ts                  │
│         app/api/budget/route.ts                             │
│                                                              │
│  Responsibility: Auth, validation, response formatting       │
│  Can call: Services ONLY                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ ExpenseService.createExpense(data)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                     SERVICES LAYER                           │
│  Files: services/expense.service.ts                         │
│         services/budget.service.ts                          │
│                                                              │
│  Responsibility: Business logic, data operations             │
│  Can call: Prisma Client ONLY                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ prisma.expense.create({ data })
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   PRISMA/DATABASE LAYER                      │
│  Files: lib/prisma.ts                                       │
│         prisma/schema.prisma                                │
│                                                              │
│  Responsibility: Database operations                         │
│  Interacts with: Supabase PostgreSQL                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL: INSERT INTO expenses (...)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE POSTGRESQL                         │
│  Tables: expenses, budgets                                   │
│  Security: Row Level Security (RLS) policies                │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Creating an Expense

```
User clicks "Add Expense"
         ↓
[AddExpenseDialog Component]
  - Collects form data
  - Calls: createExpense({ amount, description, category })
         ↓
[utils/api-helpers/expense.ts]
  - Validates input
  - fetch('/api/expenses/new', { method: 'POST', body: JSON.stringify(data) })
         ↓
[app/api/expenses/new/route.ts]
  - Authenticates user via Supabase
  - Validates request body
  - Calls: ExpenseService.createExpense({ userId, ...data })
         ↓
[services/expense.service.ts]
  - Business logic (if any)
  - Calls: prisma.expense.create({ data })
         ↓
[Prisma Client]
  - Generates SQL query
  - Executes: INSERT INTO expenses (user_id, amount, description, category, date, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ↓
[Supabase PostgreSQL]
  - Checks RLS policies
  - Inserts row into expenses table
  - Returns created record
         ↓
[Response flows back up]
  Service → Endpoint → API Helper → Component
         ↓
UI updates with new expense
```

## File Structure Map

```
/Users/beetee/Documents/Projects/BoLui/
│
├── app/                              # Next.js App Router
│   ├── api/                          # ✅ API ENDPOINTS LAYER
│   │   ├── expenses/
│   │   │   └── new/
│   │   │       ├── route.ts          # GET, POST
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET, PATCH, DELETE
│   │   └── budget/
│   │       └── route.ts              # GET, POST, DELETE
│   │
│   ├── dashboard/                    # ✅ FRONTEND LAYER
│   │   └── page.tsx
│   ├── login/
│   └── signup/
│
├── components/                       # ✅ FRONTEND LAYER
│   ├── add-expense-dialog.tsx
│   ├── expenses-list.tsx
│   ├── budget-setup-dialog.tsx
│   └── budget-overview.tsx
│
├── stores/                           # ✅ FRONTEND LAYER
│   ├── user/store.ts
│   ├── expense/store.ts
│   ├── budget/store.ts
│   └── index.ts
│
├── utils/                            # ✅ API HELPERS LAYER
│   └── api-helpers/
│       ├── expense.ts                # Frontend → API
│       ├── budget.ts                 # Frontend → API
│       └── index.ts
│
├── services/                         # ✅ SERVICES LAYER
│   ├── expense.service.ts            # API → Prisma
│   └── budget.service.ts             # API → Prisma
│
├── lib/                              # ✅ PRISMA/DATABASE LAYER
│   ├── prisma.ts                     # Prisma Client singleton
│   └── supabase/                     # Supabase utilities
│       ├── server.ts
│       └── client.ts
│
├── prisma/                           # ✅ PRISMA/DATABASE LAYER
│   ├── schema.prisma                 # Database schema
│   └── README.md
│
└── Documentation/
    ├── ARCHITECTURE.md               # This architecture guide
    ├── PRISMA_INTEGRATION.md         # Prisma setup summary
    └── README.md                     # Project overview
```

## Layer Communication Rules

```
✅ ALLOWED:
Frontend → API Helpers → API Endpoints → Services → Prisma → Database

❌ NOT ALLOWED:
Frontend ❌→ API Endpoints (bypass helpers)
Frontend ❌→ Services (bypass API)
Frontend ❌→ Prisma (bypass everything)
API Endpoints ❌→ Prisma (bypass services)
Services ❌→ API Endpoints (circular dependency)
```

## Technology Stack by Layer

| Layer         | Technologies                          |
| ------------- | ------------------------------------- |
| Frontend      | React, Next.js, MUI, MobX, TypeScript |
| API Helpers   | Fetch API, TypeScript                 |
| API Endpoints | Next.js Route Handlers, Supabase Auth |
| Services      | TypeScript, Business Logic            |
| Prisma        | Prisma Client, TypeScript             |
| Database      | Supabase PostgreSQL, RLS              |

## Example: Complete Feature Flow

### Expense Management Feature

```
┌─────────────────────────────────────────────────────────┐
│ 1. FRONTEND                                             │
│    import { getExpenses, createExpense, deleteExpense } │
│    from '@/utils/api-helpers'                           │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ 2. API HELPERS (utils/api-helpers/expense.ts)           │
│    - getExpenses() → GET /api/expenses/new              │
│    - createExpense(data) → POST /api/expenses/new       │
│    - deleteExpense(id) → DELETE /api/expenses/new/:id   │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ 3. API ENDPOINTS                                         │
│    app/api/expenses/new/route.ts                        │
│    - GET handler → ExpenseService.getExpensesByUserId() │
│    - POST handler → ExpenseService.createExpense()      │
│    app/api/expenses/new/[id]/route.ts                   │
│    - DELETE handler → ExpenseService.deleteExpense()    │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ 4. SERVICES (services/expense.service.ts)               │
│    class ExpenseService {                               │
│      static getExpensesByUserId(userId)                 │
│      static createExpense(data)                         │
│      static deleteExpense(id, userId)                   │
│    }                                                     │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ 5. PRISMA (lib/prisma.ts)                               │
│    prisma.expense.findMany({ where: { userId } })       │
│    prisma.expense.create({ data })                      │
│    prisma.expense.delete({ where: { id } })             │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ 6. DATABASE (Supabase PostgreSQL)                       │
│    SELECT * FROM expenses WHERE user_id = $1            │
│    INSERT INTO expenses (...) VALUES (...)              │
│    DELETE FROM expenses WHERE id = $1                   │
└─────────────────────────────────────────────────────────┘
```

## Benefits Visualization

```
┌────────────────────────────────────────────────────────┐
│  LAYERED ARCHITECTURE BENEFITS                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  🔒 Security                                            │
│     Auth handled at API layer, services trust input    │
│                                                         │
│  🧪 Testability                                         │
│     Each layer tested independently                    │
│                                                         │
│  ♻️  Reusability                                        │
│     Services used by multiple endpoints                │
│                                                         │
│  🔧 Maintainability                                     │
│     Changes in one layer don't affect others           │
│                                                         │
│  📘 Type Safety                                         │
│     TypeScript interfaces across all layers            │
│                                                         │
│  ⚡ Performance                                          │
│     Prisma optimizes queries, connection pooling       │
│                                                         │
│  👨‍💻 Developer Experience                                │
│     Clear patterns, easy to understand and extend      │
│                                                         │
└────────────────────────────────────────────────────────┘
```
