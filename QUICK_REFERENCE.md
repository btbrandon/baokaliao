# BoLui Quick Reference

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Setup check
./scripts/setup-check.sh

# Start development server
npm run dev
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Building
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Type Checking
npx tsc --noEmit    # Check TypeScript errors
```

## 📁 Project Structure Quick Reference

```
app/
  ├── api/              # API routes
  ├── dashboard/        # Main dashboard
  ├── login/           # Login page
  ├── signup/          # Signup page
  └── page.tsx         # Root redirect

components/
  ├── add-expense-dialog.tsx
  ├── expenses-list.tsx
  └── providers.tsx

stores/
  ├── user/            # User authentication state
  ├── expense/         # Expenses data & operations
  └── category/        # Categories configuration

lib/
  ├── services/        # API service layer
  ├── supabase/        # Supabase clients
  ├── utils/           # Helper functions
  └── theme.ts         # MUI theme
```

## 🎯 Common Tasks

### Add a New Expense Category

```typescript
// stores/category/store.ts
{ id: '9', name: 'Travel', icon: '✈️', color: '#FF9800' }
```

### Create a New Component

```tsx
'use client';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';

const MyComponent = observer(() => {
  const { userStore, expensesStore } = useStores();
  return <div>...</div>;
});

export default MyComponent;
```

### Add an API Route

```typescript
// app/api/my-route/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  // Your logic here
  return NextResponse.json({ data: 'response' });
}
```

## 🗄️ Database Quick Reference

### Supabase SQL Editor Shortcuts

```sql
-- View all expenses
SELECT * FROM expenses ORDER BY date DESC LIMIT 10;

-- Total expenses by category
SELECT category, SUM(amount) as total
FROM expenses
GROUP BY category
ORDER BY total DESC;

-- Monthly summary
SELECT DATE_TRUNC('month', date) as month,
       COUNT(*) as count,
       SUM(amount) as total
FROM expenses
GROUP BY month
ORDER BY month DESC;
```

## 🔐 Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional (Cloudflare)
CLOUDFLARE_EMAIL=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

## 🎨 MUI Theme Colors

```typescript
// lib/theme.ts
primary: {
  main: '#6366f1',    // Indigo
  light: '#818cf8',
  dark: '#4f46e5',
}

secondary: {
  main: '#ec4899',    // Pink
  light: '#f472b6',
  dark: '#db2777',
}
```

## 🪝 Useful Hooks

```typescript
// Access stores
const { userStore, expensesStore, categoriesStore } = useStores();

// Router navigation
const router = useRouter();
router.push('/dashboard');
router.refresh();

// Supabase client
const supabase = createClient();
```

## 🚀 Deployment Checklist

- [ ] Run `npm run build` locally
- [ ] Fix all TypeScript errors
- [ ] Set environment variables in hosting dashboard
- [ ] Test authentication flow
- [ ] Test expense CRUD operations
- [ ] Verify Supabase RLS policies
- [ ] Check responsive design on mobile

## 📝 Git Commands

```bash
# Status and changes
git status
git diff

# Commit workflow
git add .
git commit -m "feat: add feature description"
git push origin main

# Branch workflow
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

## 🐛 Debugging Tips

```bash
# Clear Next.js cache
rm -rf .next

# Check for errors
npm run lint
npx tsc --noEmit

# View Supabase logs
# Go to: Supabase Dashboard → Logs

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

## 📚 Quick Links

| Resource           | URL                          |
| ------------------ | ---------------------------- |
| Supabase Dashboard | https://app.supabase.com     |
| Next.js Docs       | https://nextjs.org/docs      |
| MUI Components     | https://mui.com/material-ui/ |
| MobX Guide         | https://mobx.js.org/         |
| React Bits         | https://reactbits.dev/       |
| Tailwind CSS       | https://tailwindcss.com/docs |

## 💡 Pro Tips

- Use `observer()` wrapper for components that read MobX stores
- Always use `'use client'` for components with hooks
- Format code before committing: `npm run format`
- Keep components small and focused
- Use TypeScript interfaces for all data structures
- Test on different screen sizes
- Check browser console for errors
- Use Supabase Dashboard for database queries

## 🆘 Getting Help

1. Check browser console for errors
2. Review Supabase logs
3. Verify environment variables
4. Check this documentation
5. Review SETUP.md and DEVELOPMENT.md

---

**Version:** 1.0.0  
**Last Updated:** October 3, 2025
