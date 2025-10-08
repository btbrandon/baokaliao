# Cloudflare Pages Deployment Guide

## Overview
This guide covers deploying the Next.js app to Cloudflare Pages using Wrangler.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Already installed as a dev dependency
3. **Node.js**: Version 18 or higher

## Setup

### 1. Authenticate Wrangler

First, log in to your Cloudflare account:

```bash
npx wrangler login
```

This will open a browser window for authentication.

### 2. Configure Environment Variables

You need to set up environment variables in the Cloudflare Dashboard:

1. Go to your Cloudflare Dashboard
2. Navigate to **Workers & Pages** > **Your Project** > **Settings** > **Environment variables**
3. Add the following variables:

#### Required Variables:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_MAPS_API_KEY=...
```

**Note**: Add these for both **Production** and **Preview** environments.

### 3. Update wrangler.toml (if needed)

The `wrangler.toml` file is already configured, but you can customize:

```toml
name = "baokaliao"  # Change this to your desired project name
compatibility_date = "2024-01-01"
```

## Deployment Commands

### Build for Cloudflare Pages

```bash
npm run pages:build
```

This command:
- Runs `next build`
- Converts the build output to Cloudflare Pages format using `@cloudflare/next-on-pages`

### Preview Locally

Test the Cloudflare Pages build locally:

```bash
npm run pages:preview
```

This runs the Pages build in a local Cloudflare Workers environment.

### Deploy to Production

```bash
npm run pages:deploy
```

This command:
1. Builds the app for Cloudflare Pages
2. Deploys to Cloudflare Pages

#### First-Time Deployment

On your first deployment, Wrangler will ask:

```
Would you like to create a new project? (Y/n)
```

Type `Y` and follow the prompts.

### Deploy via Git Integration (Recommended)

Alternatively, you can set up automatic deployments:

1. Go to **Cloudflare Dashboard** > **Workers & Pages**
2. Click **Create application** > **Pages** > **Connect to Git**
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Framework preset**: Next.js
5. Add environment variables in the dashboard
6. Click **Save and Deploy**

Now every push to your repository will trigger an automatic deployment!

## Important Considerations

### 1. Next.js Limitations on Cloudflare Pages

Some Next.js features have limitations on Cloudflare Pages:

- **Image Optimization**: Disabled (set to `unoptimized: true`)
- **Middleware**: Supported with some limitations
- **Server Actions**: Supported
- **App Router**: Fully supported
- **API Routes**: Supported

### 2. Database Connection

- Ensure your Supabase database allows connections from Cloudflare IPs
- Consider using Supabase's connection pooling (already configured with `DIRECT_URL`)

### 3. Cold Starts

- Cloudflare Workers have minimal cold start times
- Your app should load very quickly

### 4. Static Assets

- Static files are automatically cached on Cloudflare's CDN
- This includes images, CSS, and JavaScript files

## Monitoring

### View Logs

```bash
npx wrangler pages deployment tail
```

### View Deployments

```bash
npx wrangler pages deployment list
```

## Troubleshooting

### Build Errors

If you encounter build errors:

1. **Clear cache and rebuild**:
   ```bash
   rm -rf .next node_modules/.cache
   npm run pages:build
   ```

2. **Check Node.js version**:
   ```bash
   node --version  # Should be 18+
   ```

### Runtime Errors

1. **Check environment variables** in Cloudflare Dashboard
2. **View logs**: `npx wrangler pages deployment tail`
3. **Test locally**: `npm run pages:preview`

### API Route Issues

If API routes aren't working:

1. Ensure they're using supported Node.js APIs
2. Check that database connections are properly configured
3. Verify environment variables are set correctly

## Alternative: OpenNext

**Note**: The `@cloudflare/next-on-pages` package is deprecated in favor of OpenNext. Consider migrating to [OpenNext](https://opennext.js.org/cloudflare) for better long-term support.

To migrate to OpenNext:

```bash
npm uninstall @cloudflare/next-on-pages
npm install -D opennext-cloudflare
```

Then update build scripts to use `opennext-cloudflare` instead.

## Performance Tips

1. **Enable Caching**: Use Cloudflare's cache API for frequently accessed data
2. **Optimize Images**: Pre-optimize images before uploading since Next.js Image Optimization is disabled
3. **Use CDN**: Static assets are automatically served from Cloudflare's global CDN
4. **Database Pooling**: Use Supabase connection pooling for better performance

## Costs

- **Cloudflare Pages Free Tier**:
  - 500 builds per month
  - Unlimited bandwidth
  - Unlimited requests
  - 100+ deployments retained

Perfect for most applications!

## Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
