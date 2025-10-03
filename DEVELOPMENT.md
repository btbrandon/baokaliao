# BoLui Development Notes

## Important Files & Directories

### Core Application

- `app/` - Next.js 14 App Router pages and API routes
- `components/` - Reusable React components
- `stores/` - MobX state management stores
- `lib/` - Utilities, services, and configurations

### Configuration Files

- `.env.local` - Environment variables (DO NOT commit)
- `middleware.ts` - Auth middleware for protected routes
- `tsconfig.json` - TypeScript configuration
- `.prettierrc` - Code formatting rules
- `.eslintrc.json` - Linting rules

## Key Architectural Decisions

### 1. State Management (MobX)

- **Why MobX?** Simple, reactive state management without boilerplate
- **Store Organization:** Separated by domain (user, expenses, categories)
- **Usage:** Use `useStores()` hook to access stores in components

### 2. Supabase Integration

- **Client-side:** `lib/supabase/client.ts` for browser
- **Server-side:** `lib/supabase/server.ts` for API routes
- **Middleware:** `lib/supabase/middleware.ts` for auth checks
- **RLS:** Row Level Security ensures data isolation

### 3. Component Structure

- **Naming:** kebab-case for files (e.g., `add-expense-dialog.tsx`)
- **Organization:** Flat structure in `components/` for now
- **Client Components:** Most components are client-side for interactivity

### 4. Styling Approach

- **Primary:** Material-UI (MUI) components
- **Utility:** Tailwind CSS for quick styling
- **Theme:** Centralized in `lib/theme.ts`
- **Responsive:** Mobile-first approach

## Database Schema

### Expenses Table

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  amount DECIMAL(10,2),
  description TEXT,
  category TEXT,
  date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Row Level Security Policies

1. Users can only SELECT their own expenses
2. Users can only INSERT with their own user_id
3. Users can only UPDATE their own expenses
4. Users can only DELETE their own expenses

## API Routes

### Authentication

- `POST /api/auth/logout` - Sign out user

### Expenses

- `GET /api/expenses` - List all user's expenses
- `POST /api/expenses` - Create new expense
- `PATCH /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Code Standards

### TypeScript

- Strict mode enabled
- No explicit `any` (use `unknown` instead)
- Define interfaces for all data structures

### Formatting

- Use Prettier for consistent formatting
- Run `npm run format` before committing
- Single quotes for strings
- 2 spaces for indentation

### Component Patterns

```tsx
// Client component with MobX observer
'use client';
import { observer } from 'mobx-react-lite';

const MyComponent = observer(() => {
  const { userStore } = useStores();
  // component logic
});

export default MyComponent;
```

## Common Tasks

### Adding a New Feature

1. Define types in `types/index.ts`
2. Update stores if state is needed
3. Create service functions in `lib/services/`
4. Create UI components in `components/`
5. Add API routes if needed in `app/api/`

### Adding a New Page

1. Create directory in `app/`
2. Add `page.tsx` file
3. Update navigation if needed

### Adding a New Category

Edit `stores/category/store.ts`:

```ts
categories: Category[] = [
  { id: 'unique-id', name: 'Category Name', icon: '🎯', color: '#HEX' },
  // ...
];
```

## Testing Checklist

Before deploying:

- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Code formatted with Prettier
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test add expense
- [ ] Test delete expense
- [ ] Test logout
- [ ] Test responsive design
- [ ] Check browser console for errors

## Performance Considerations

### Current Optimizations

- Server-side auth checks in middleware
- Client-side MobX for reactive updates
- Lazy loading with Next.js dynamic imports

### Future Optimizations

- Add React Query for caching
- Implement pagination for expenses list
- Add virtual scrolling for long lists
- Optimize images with next/image

## Security Notes

### Best Practices Implemented

- ✅ Row Level Security (RLS) in Supabase
- ✅ Auth middleware on protected routes
- ✅ Environment variables for secrets
- ✅ HTTPS in production (via Vercel/hosting)

### Security Checklist

- [ ] Never commit `.env.local`
- [ ] Never expose service role key to client
- [ ] Validate all user inputs
- [ ] Sanitize data before display
- [ ] Use parameterized queries (Supabase handles this)

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Type Errors

```bash
# Regenerate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

### Auth Issues

- Clear browser cookies
- Check Supabase auth settings
- Verify environment variables
- Check middleware.ts matcher patterns

## Resources & Links

- **Supabase Dashboard:** https://app.supabase.com
- **Next.js Docs:** https://nextjs.org/docs
- **MUI Components:** https://mui.com/material-ui/
- **MobX Guide:** https://mobx.js.org/
- **React Bits:** https://reactbits.dev/

## Future Enhancements

Priority list:

1. **Edit Expense** - Add edit functionality
2. **Analytics** - Charts and visualizations
3. **Budget Tracking** - Set and monitor budgets
4. **Export Data** - CSV/PDF export
5. **Recurring Expenses** - Auto-add monthly expenses
6. **Dark Mode** - Theme switcher
7. **Multi-currency** - Support different currencies
8. **Search & Filter** - Advanced filtering
9. **Tags** - Add custom tags to expenses
10. **Notifications** - Budget alerts

## Team Guidelines

### Git Workflow

1. Create feature branch: `git checkout -b feature/expense-edit`
2. Make changes and commit
3. Format code: `npm run format`
4. Push and create PR
5. Review and merge

### Commit Messages

- `feat: add expense editing`
- `fix: resolve login redirect issue`
- `style: update button styles`
- `refactor: reorganize store structure`
- `docs: update setup guide`

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

---

Last updated: October 3, 2025
