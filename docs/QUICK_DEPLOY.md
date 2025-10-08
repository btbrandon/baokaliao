# Quick Deployment Guide

## Deploy to Cloudflare Pages in 3 Steps

### 1. Login to Cloudflare

```bash
npx wrangler login
```

### 2. Build for Cloudflare Pages

```bash
npm run pages:build
```

### 3. Deploy

```bash
npm run pages:deploy
```

That's it! Your app will be live on Cloudflare Pages.

## Set Environment Variables

After first deployment, add your environment variables in the Cloudflare Dashboard:

1. Go to **Cloudflare Dashboard** > **Workers & Pages** > **Your Project**
2. Click **Settings** > **Environment variables**
3. Add these variables:

```
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_MAPS_API_KEY
```

4. Click **Save** and redeploy

## Alternative: Git-Based Deployment (Recommended)

For automatic deployments on every push:

1. Push your code to GitHub/GitLab
2. Go to **Cloudflare Dashboard** > **Workers & Pages**
3. Click **Create application** > **Pages** > **Connect to Git**
4. Select your repository
5. Set build command: `npm run pages:build`
6. Set build output: `.vercel/output/static`
7. Add environment variables
8. Click **Save and Deploy**

Done! Now every push automatically deploys.

## View Your Site

After deployment, Wrangler will show you the URL:
```
✨ Deployment complete! Take a peek over at https://your-project.pages.dev
```

## Need Help?

See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed instructions.
