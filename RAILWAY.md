# Deploy to Railway.com (Sandbox)

## Quick Setup

1. **Push your code to GitHub**

2. **Create new project on Railway.com**
   - Connect your GitHub repository
   - Select `apps/sos360-api` as the root directory

3. **Add PostgreSQL database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

4. **Set environment variables** in Railway dashboard:
   ```
   NODE_ENV=production
   API_VERSION=v1
   APP_NAME=SOS360-API

   JWT_SECRET=sandbox-jwt-secret-minimum-64-chars-for-testing-purposes-only-change
   JWT_REFRESH_SECRET=sandbox-jwt-refresh-minimum-64-chars-for-testing-purposes-change
   COOKIE_SECRET=sandbox-cookie-secret-minimum-64-chars-for-testing-purposes-change
   ```

5. **Deploy**
   - Railway will automatically build using the Dockerfile
   - Your API will be available at the generated Railway URL

## Database Migrations

After first deployment, run migrations:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

## Health Check

Your API health endpoint will be available at:
```
https://your-app.railway.app/health
```

## Environment Variables Required

- `DATABASE_URL` - Auto-set by Railway PostgreSQL
- `NODE_ENV` - Set to "production"
- `PORT` - Auto-set by Railway (default: 3002)
- `JWT_SECRET` - Set manually (min 64 chars in production)
- `JWT_REFRESH_SECRET` - Set manually (min 64 chars in production)
- `COOKIE_SECRET` - Set manually (min 64 chars in production)

## Optional Variables

All other services (Firebase, Stripe, SMTP, Redis, SpotOnSite) are optional.
Leave them unset or set to empty strings if not needed.

## Logs

View logs in Railway dashboard or via CLI:
```bash
railway logs
```
