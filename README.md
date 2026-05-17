# Netsync Logistics Platform

Fast, transparent delivery platform for Lagos, Nigeria.

## ✨ Features

- **Real-time pricing** with distance & surge calculation
- **Smart error codes** for better debugging
- **10+ job status tracking** for transparency
- **Mobile-first design** with dark mode
- **Nigerian phone validation**
- **OTP-based authentication**

## 🚀 Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

## 📍 Key Files

### Core Libraries
- `lib/errors.ts` - Error handling with proper HTTP codes
- `lib/pricing.ts` - Distance-based dynamic pricing engine

### Enhanced APIs
- `app/api/auth/send-otp/` - Phone validation & OTP
- `app/api/auth/send-otp/verify-otp/` - OTP verification

### Updated UI
- `app/(customer)/dashboard/post-job/` - Real-time pricing booking

### Database
- `prisma/schema.prisma` - Updated with notifications & tracking

### Types
- `types/index.ts` - ErrorCode enum & pricing types

## 💰 Pricing Example

**Bike delivery, 6.5km, 7-9 AM:**
- Base: ₦2,500
- Distance (6.5 × ₦200): ₦1,300
- Surge (1.5x): ₦1,900
- **Total: ₦5,700** (estimated 10 mins)

## 🔧 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_PHONE | 400 | Wrong Nigerian format |
| INVALID_OTP | 401 | Wrong OTP code |
| PHONE_REQUIRED | 400 | Missing phone number |
| DATABASE_ERROR | 500 | Database issue |

## 📱 Booking Flow

1. Enter pickup & dropoff locations
2. Select vehicle type → Get price estimate
3. Review & confirm booking

## 🚀 Deployment

```bash
npm run build
npx prisma migrate deploy
npm run start
```

---

**Status**: Production ready ✅
