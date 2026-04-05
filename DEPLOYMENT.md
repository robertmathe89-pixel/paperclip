# TaskFlow Deployment Guide

## Prerequisites

1. **GitHub Repository**
   - Create a new repository on GitHub
   - Push this codebase to it

2. **PostgreSQL Database**
   - Create a free database at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
   - Copy the connection string (looks like: `postgresql://user:pass@host:5432/dbname`)

3. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)
   - Connect your GitHub account

## Deployment Steps

### 1. Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit: TaskFlow MVP"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Database Setup
```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

### 3. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (random 256-bit string)
# - NEXTAUTH_URL (your production URL)
# - NEXTAUTH_SECRET (random string)
```

### 4. Environment Variables Required
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/taskflow` |
| `JWT_SECRET` | Secret for JWT token signing | Random 256-bit string |
| `NEXTAUTH_URL` | Application URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret | Random string |

### 5. CI/CD
GitHub Actions workflow is configured at `.github/workflows/ci.yml` and will automatically:
- Run type checks
- Run linting
- Build the application
- Use PostgreSQL service for database operations

## Post-Deployment

1. Run database migrations in production:
   ```bash
   npx prisma migrate deploy
   ```

2. Set up custom domain in Vercel dashboard (optional)

3. Monitor application logs in Vercel dashboard

## Troubleshooting

- **Build fails**: Ensure `DATABASE_URL` is set in Vercel environment variables
- **Database connection errors**: Verify PostgreSQL connection string and network access
- **Auth errors**: Ensure `JWT_SECRET` and `NEXTAUTH_SECRET` are properly configured
