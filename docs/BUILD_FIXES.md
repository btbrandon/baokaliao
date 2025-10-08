# Build Fixes Applied

## Issues Fixed

### 1. Invalid Next.js Configuration

**Error:**

```
⚠ Invalid next.config.mjs options detected:
⚠     Unrecognized key(s) in object: 'runtime' at "experimental"
```

**Solution:**
Removed the invalid `experimental.runtime` configuration from `next.config.mjs`.

**Before:**

```javascript
const nextConfig = {
  experimental: {
    runtime: 'experimental-edge', // ❌ Invalid in Next.js 15
  },
  images: {
    unoptimized: true,
  },
};
```

**After:**

```javascript
const nextConfig = {
  images: {
    unoptimized: true,
  },
};
```

### 2. Incorrect Prisma Import Path

**Error:**

```
Module not found: Can't resolve '@/lib/prisma/prisma'
```

**Solution:**
Fixed the import path in `app/api/expenses/prisma/route.ts`.

**Before:**

```typescript
import { prisma } from '@/lib/prisma/prisma'; // ❌ Wrong path
```

**After:**

```typescript
import { prisma } from '@/lib/prisma'; // ✅ Correct path
```

The actual file is `lib/prisma.ts`, so the import should be `@/lib/prisma`.

## Current Configuration

### next.config.mjs

```javascript
const nextConfig = {
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
};
```

### Key Points

1. **Next.js 15 Changes**: The `experimental.runtime` option is no longer valid in Next.js 15
2. **Edge Runtime**: For Cloudflare Pages, the edge runtime is automatically detected and doesn't need explicit configuration
3. **Image Optimization**: Disabled for Cloudflare Pages compatibility (they use their own image optimization)
4. **Import Paths**: Always verify import paths match actual file locations

## Build Command

The correct build command for Cloudflare Pages:

```bash
npm run pages:build
```

This runs:

1. `next build` - Builds the Next.js app
2. `@cloudflare/next-on-pages` - Converts the build for Cloudflare Pages

## Testing Before Deployment

Always test the build locally before deploying:

```bash
# Clean build
rm -rf .next .vercel

# Test regular build
npm run build

# Test Cloudflare Pages build
npm run pages:build

# Preview locally with Cloudflare Workers
npm run pages:preview
```

## Common Build Issues

### Issue: Module Not Found

**Solution:** Check import paths and ensure files exist at the specified locations

### Issue: Invalid Config

**Solution:** Check Next.js documentation for the version you're using, as config options change between versions

### Issue: Build Timeout

**Solution:** Increase build timeout in Cloudflare Pages settings or optimize your build

### Issue: Environment Variables Not Found

**Solution:** Ensure all required environment variables are set in Cloudflare Dashboard

## Verification

After fixing these issues, your build should complete successfully:

```bash
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Next Steps

1. ✅ Build configuration fixed
2. ✅ Import paths corrected
3. 🔄 Ready to deploy to Cloudflare Pages
4. Run `npm run pages:deploy` to deploy
