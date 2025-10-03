# BoLui Setup Guide

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or higher installed
- A Supabase account (free tier is fine)
- Git installed (optional)

## Step 1: Supabase Setup

1. **Create a new Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in your project details
   - Wait for the project to be created (takes ~2 minutes)

2. **Get your API credentials:**
   - In your Supabase dashboard, go to Settings → API
   - Copy the following:
     - Project URL
     - `anon` public key
     - `service_role` key (keep this secret!)

3. **Set up the database:**
   - In your Supabase dashboard, go to SQL Editor
   - Create a new query
   - Copy the contents of `supabase/schema.sql` from this project
   - Run the query to create the `expenses` table and policies

## Step 2: Project Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**
   - The `.env.local` file should already have your credentials
   - Make sure it has these values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Run the development server:**

```bash
npm run dev
```

4. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should be redirected to the login page

## Step 3: Testing the Application

1. **Create an account:**
   - Click "Sign Up" on the login page
   - Enter your email and password
   - Submit the form

2. **Verify your email (optional):**
   - Check your email for a confirmation link
   - Or disable email confirmation in Supabase (Settings → Authentication → Email Auth)

3. **Start tracking expenses:**
   - You'll be redirected to the dashboard
   - Click "Add Expense" button
   - Fill in the expense details
   - Submit the form

## Database Schema Explained

The `expenses` table has the following structure:

```sql
expenses (
  id UUID PRIMARY KEY,
  user_id UUID (references auth.users),
  amount DECIMAL(10,2),
  description TEXT,
  category TEXT,
  date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Row Level Security (RLS)

The database uses RLS policies to ensure:

- Users can only see their own expenses
- Users can only create expenses for themselves
- Users can only update/delete their own expenses

## Common Issues & Solutions

### Issue: "Invalid API Key"

**Solution:** Double-check your `.env.local` file has the correct Supabase credentials.

### Issue: "Table 'expenses' does not exist"

**Solution:** Make sure you ran the SQL script from `supabase/schema.sql` in your Supabase SQL Editor.

### Issue: "Not authenticated"

**Solution:** Clear your browser cookies and try logging in again.

### Issue: Email confirmation required

**Solution:** Either:

- Check your email and click the confirmation link
- Or disable email confirmation in Supabase: Settings → Authentication → Email Auth → Disable "Enable email confirmations"

## Project Architecture

```
BoLui/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── add-expense-dialog.tsx
│   ├── expenses-list.tsx
│   └── providers.tsx
├── lib/                     # Utilities & configs
│   ├── services/           # API service layer
│   ├── supabase/           # Supabase clients
│   ├── utils/              # Helper functions
│   └── theme.ts            # MUI theme
├── stores/                  # MobX state stores
│   ├── UserStore.ts
│   ├── ExpensesStore.ts
│   ├── CategoriesStore.ts
│   └── index.ts
├── types/                   # TypeScript types
└── supabase/               # Database schema
```

## Development Workflow

1. **Make changes to code**
2. **Format code:** `npm run format`
3. **Check for errors:** `npm run lint`
4. **Test in browser:** `npm run dev`
5. **Build for production:** `npm run build`

## Next Steps

After setup, you can:

1. **Customize categories:**
   - Edit `stores/CategoriesStore.ts`
   - Add your own categories with custom icons and colors

2. **Add more features:**
   - Monthly/yearly reports
   - Budget tracking
   - Export functionality
   - Charts and visualizations

3. **Enhance UI:**
   - Visit [https://reactbits.dev](https://reactbits.dev) for animated components
   - Visit [https://mui.com](https://mui.com) for more MUI components
   - Customize the theme in `lib/theme.ts`

4. **Deploy:**
   - Deploy to Vercel, Netlify, or your preferred hosting
   - Update environment variables in your hosting dashboard

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your Supabase credentials
3. Ensure the database schema is set up correctly
4. Check the Supabase logs in your dashboard

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Material-UI Documentation](https://mui.com/material-ui/)
- [MobX Documentation](https://mobx.js.org/)
- [React Bits Components](https://reactbits.dev/)
