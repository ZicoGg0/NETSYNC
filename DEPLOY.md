# Netsync - Production Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/netsync"

# Authentication - Generate with: openssl rand -base64 32
JWT_SECRET="your-32-char-random-secret-key"

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Termii SMS API Key (for OTP in Nigeria)
TERMII_API_KEY="your-termii-api-key"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

## Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed database (optional)
npx prisma db seed

# 5. Build for production
npm run build

# 6. Start production server
npm run start
```

## Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only!)
npx prisma migrate reset
```

## Running Locally

```bash
npm run dev
# Visit http://localhost:3000
```

## Key Features Implemented

✅ OTP-based authentication (Nigerian phone numbers)  
✅ Real-time pricing with surge calculation  
✅ JWT token management with 7-day expiry  
✅ Role-based access control (CUSTOMER, PROVIDER, ADMIN)  
✅ Database models: User, Job, LocationHistory, OTP, NotificationEvent  
✅ Error handling with 28+ error codes  
✅ Mobile-first responsive design  

## File Structure Overview

```
netsync/
├── app/                      # Next.js app directory
│   ├── api/auth/            # Authentication API routes
│   ├── (customer)/          # Customer pages
│   ├── (provider)/          # Provider pages
│   ├── (admin)/             # Admin pages
│   └── (auth)/              # Auth pages
├── lib/                     # Utilities
│   ├── auth.ts              # JWT token generation & validation
│   ├── prisma.ts            # Prisma singleton
│   ├── termii.ts            # OTP service
│   ├── pricing.ts           # Pricing calculations
│   └── errors.ts            # Error handling
├── types/                   # TypeScript types
├── prisma/                  # Database schema
├── middleware.ts            # Route protection
└── components/              # React components
```

## Troubleshooting

### JWT_SECRET not found
Set `JWT_SECRET` in `.env.local`. Generate with:
```bash
openssl rand -base64 32
```

### Termii API errors
Check `TERMII_API_KEY` is valid. SMS will be mocked in development if key is missing.

### Database connection errors
Verify PostgreSQL is running and `DATABASE_URL` is correct:
```bash
npx prisma db push
```

### Prisma client errors
Regenerate Prisma client:
```bash
npx prisma generate
```

## Performance Tips

1. Enable query result caching where possible
2. Use database indexes for common queries
3. Implement rate limiting on API routes
4. Use CDN for static assets
5. Monitor OTP generation for abuse

## Security Checklist

- ✅ Set strong `JWT_SECRET` (minimum 32 characters)
- ✅ Use `NODE_ENV=production`
- ✅ Enable HTTPS on production
- ✅ Set secure cookie flags (httpOnly, secure, sameSite)
- ✅ Validate all user inputs
- ✅ Use environment variables for secrets
- ✅ Rate limit OTP endpoint
- ✅ Implement CORS properly

## Production Deployment (Vercel)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect GitHub repo to Vercel
# Visit: https://vercel.com

# 3. Set environment variables in Vercel dashboard

# 4. Deploy
# Automatic on push, or manual from dashboard
```

## Monitoring

- Check logs: `vercel logs` (for Vercel deployments)
- Monitor database: Use PostgreSQL admin tools
- Set up error tracking: Sentry, DataDog, etc.
- Monitor API response times
- Alert on failed OTP deliveries

## Support & Documentation

- Issues: GitHub issues
- Database: `npx prisma studio`
- API Testing: Postman or Insomnia

---

**Status**: Production Ready ✅
