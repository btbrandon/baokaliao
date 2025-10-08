# Prisma Database Management

This project uses [Prisma](https://www.prisma.io/) as the ORM to manage database operations with Supabase PostgreSQL.

## Database Schema

### Tables

#### `expenses`

Stores all user expense records.

| Column      | Type          | Description           |
| ----------- | ------------- | --------------------- |
| id          | UUID          | Primary key           |
| userId      | UUID          | References auth.users |
| amount      | Decimal(10,2) | Expense amount        |
| description | Text          | Expense description   |
| category    | Text          | Expense category      |
| date        | Date          | Expense date          |
| createdAt   | Timestamp     | Record creation time  |
| updatedAt   | Timestamp     | Record update time    |

**Indexes:**

- `idx_expenses_user_id` on userId
- `idx_expenses_date` on date (DESC)

#### `budgets`

Stores user budget allocation settings.

| Column                | Type          | Description                    |
| --------------------- | ------------- | ------------------------------ |
| id                    | UUID          | Primary key                    |
| userId                | UUID          | References auth.users (UNIQUE) |
| monthlyIncome         | Decimal(10,2) | Monthly income amount          |
| expensesPercentage    | Decimal(5,2)  | % allocated to expenses        |
| investmentsPercentage | Decimal(5,2)  | % allocated to investments     |
| savingsPercentage     | Decimal(5,2)  | % allocated to savings         |
| otherPercentage       | Decimal(5,2)  | % allocated to other           |
| createdAt             | Timestamp     | Record creation time           |
| updatedAt             | Timestamp     | Record update time             |

**Indexes:**

- `idx_budgets_user_id` on userId

**Constraints:**

- Sum of all percentages must equal 100

## Available Commands

### Generate Prisma Client

```bash
npm run prisma:generate
```

Generates the Prisma Client based on your schema. Run this after modifying `schema.prisma`.

### Push Schema to Database

```bash
npm run prisma:push
```

Pushes your schema changes to the database without creating migrations. Best for development.

### Create Migration

```bash
npm run prisma:migrate
```

Creates a new migration based on schema changes and applies it to the database.

### Open Prisma Studio

```bash
npm run prisma:studio
```

Opens Prisma Studio - a visual database browser at http://localhost:5555

## Usage in Code

### Import Prisma Client

```typescript
import { prisma } from '@/lib/prisma';
```

### Query Examples

#### Create an expense

```typescript
const expense = await prisma.expense.create({
  data: {
    userId: user.id,
    amount: 50.0,
    description: 'Lunch',
    category: 'Food',
    date: new Date(),
  },
});
```

#### Find all expenses for a user

```typescript
const expenses = await prisma.expense.findMany({
  where: {
    userId: user.id,
  },
  orderBy: {
    date: 'desc',
  },
});
```

#### Update a budget

```typescript
const budget = await prisma.budget.upsert({
  where: {
    userId: user.id,
  },
  update: {
    monthlyIncome: 5000,
    expensesPercentage: 50,
    investmentsPercentage: 25,
    savingsPercentage: 20,
    otherPercentage: 5,
  },
  create: {
    userId: user.id,
    monthlyIncome: 5000,
    expensesPercentage: 50,
    investmentsPercentage: 25,
    savingsPercentage: 20,
    otherPercentage: 5,
  },
});
```

#### Delete an expense

```typescript
await prisma.expense.delete({
  where: {
    id: expenseId,
  },
});
```

#### Get budget with calculated totals

```typescript
const budget = await prisma.budget.findUnique({
  where: {
    userId: user.id,
  },
});

if (budget) {
  const expensesAmount = (budget.monthlyIncome * budget.expensesPercentage) / 100;
  const investmentsAmount = (budget.monthlyIncome * budget.investmentsPercentage) / 100;
  // ... and so on
}
```

## Environment Variables

Make sure these are set in your `.env` file:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

- `DATABASE_URL`: Connection pooling URL (port 6543)
- `DIRECT_URL`: Direct connection URL (port 5432) for migrations

## Schema Updates

When you modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:push` (development) or `npm run prisma:migrate` (production)
3. Run `npm run prisma:generate` to update the client

## Troubleshooting

### "Environment variable not found"

Make sure `.env` file exists with correct DATABASE_URL and DIRECT_URL.

### "Can't reach database server"

Check that your Supabase connection string is correct and network is accessible.

### Type errors after schema changes

Run `npm run prisma:generate` to regenerate the Prisma Client types.

## Best Practices

1. **Always use transactions** for operations that modify multiple records
2. **Use connection pooling** (DATABASE_URL with pooler) for serverless environments
3. **Use direct connection** (DIRECT_URL) only for migrations
4. **Enable RLS** in Supabase for security (already configured)
5. **Use Prisma Studio** to inspect and debug data during development

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
