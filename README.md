# BaoKaLiao - Expense Tracker

A modern expense tracking application built with Next.js 14, TypeScript, Material-UI, and Supabase.

## Features

- 🔐 **User Authentication** - Secure login and signup with Supabase Auth
- 💰 **Expense Tracking** - Add, view, and delete expenses with ease
- 📊 **Dashboard** - Beautiful summary of your expenses
- 🎨 **Modern UI** - Built with Material-UI and Tailwind CSS
- 🔄 **Real-time Updates** - MobX state management for reactive UI
- 📱 **Responsive Design** - Works perfectly on all devices

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Material-UI (MUI)
- **State Management:** MobX
- **Backend:** Supabase (PostgreSQL + Auth)
- **Code Quality:** Prettier + ESLint

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project set up

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Ensure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
   Run the SQL script in `supabase/schema.sql` in your Supabase SQL editor to create the necessary tables and policies.

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
BaoKaLiao/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── AddExpenseDialog.tsx
│   ├── ExpensesList.tsx
│   └── Providers.tsx
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   └── theme.ts          # MUI theme configuration
├── stores/               # MobX stores
│   ├── UserStore.ts
│   ├── ExpensesStore.ts
│   ├── CategoriesStore.ts
│   └── index.ts
├── supabase/             # Database schema
│   └── schema.sql
└── middleware.ts         # Auth middleware
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run pages:preview` - Preview Cloudflare Pages build locally
- `npm run pages:deploy` - Deploy to Cloudflare Pages

## Deployment

### Deploy to Cloudflare Pages

This app is configured to deploy to Cloudflare Pages using Wrangler.

**Quick Deploy:**

```bash
npx wrangler login
npm run pages:deploy
```

**Git-Based Deployment (Recommended):**

1. Push your code to GitHub/GitLab
2. Connect repository in Cloudflare Dashboard
3. Set build command: `npm run pages:build`
4. Set build output: `.vercel/output/static`
5. Add environment variables
6. Automatic deployments on every push!

For detailed instructions, see:

- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Quick start guide
- [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - Comprehensive guide

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Database Schema

### Expenses Table

| Column      | Type      | Description               |
| ----------- | --------- | ------------------------- |
| id          | UUID      | Primary key               |
| user_id     | UUID      | Foreign key to auth.users |
| amount      | DECIMAL   | Expense amount            |
| description | TEXT      | Expense description       |
| category    | TEXT      | Expense category          |
| date        | DATE      | Date of expense           |
| created_at  | TIMESTAMP | Record creation timestamp |
| updated_at  | TIMESTAMP | Record update timestamp   |

## Using React Bits Components

React Bits is a copy-paste component library. To use components:

1. Visit [https://reactbits.dev/](https://reactbits.dev/)
2. Browse and select a component
3. Copy the code from the Code tab
4. Install any required dependencies
5. Paste into your components folder
6. Customize as needed

## Features Roadmap

- [ ] Edit expenses
- [ ] Expense categories management
- [ ] Monthly/yearly reports
- [ ] Export data (CSV, PDF)
- [ ] Budget tracking
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] Charts and analytics
- [ ] Dark mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
