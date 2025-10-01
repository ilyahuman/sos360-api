# Deploy to Railway.com

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
   PORT=3002
   API_VERSION=v1
   APP_NAME=SOS360-API

   JWT_SECRET=your-secret-here-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-here
   COOKIE_SECRET=your-cookie-secret-here
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
- `PORT` - Auto-set by Railway
- `JWT_SECRET` - Set manually (min 32 chars)
- `JWT_REFRESH_SECRET` - Set manually
- `COOKIE_SECRET` - Set manually

## Optional Variables

- Firebase, Stripe, SMTP configs (see `.env.docker` for reference)

## Logs

View logs in Railway dashboard or via CLI:
```bash
railway logs
```
