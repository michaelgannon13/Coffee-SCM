# ☕ Coffee Supply Chain Management MVP

A farmer-coop management system for tracking coffee harvests from farm to co-op.

## 🎯 Overview

This MVP enables:
- **Farmers**: Log harvests via mobile app, generate QR codes for batches
- **Co-op Admins**: View and manage all member harvests via web dashboard
- **Traceability**: QR codes link batches to farmer and harvest details
- **Price Transparency**: Live NY-C coffee price widget

## 🏗️ Architecture

### Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Web Dashboard**: Next.js + TailwindCSS
- **Mobile App**: React Native (Expo)
- **Deployment**: Railway (backend), Vercel (web), Expo Go (mobile)

### Project Structure
```
coffee-supply-chain/
├── backend/              # API server
│   ├── server.js         # Express app
│   ├── database/         # SQL schema
│   └── scripts/          # DB init & seed
├── web-dashboard/        # Admin web app
│   └── src/
│       ├── app/          # Next.js pages
│       └── lib/          # API client
└── mobile-app/           # Farmer mobile app
    └── src/
        ├── screens/      # App screens
        └── utils/        # API client
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Expo CLI (for mobile dev)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure database
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Initialize database
npm run init-db

# Seed with demo data
npm run seed

# Start server
npm run dev
```

Backend runs on `http://localhost:3001`

### 2. Web Dashboard Setup

```bash
cd web-dashboard
npm install

# Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start dev server
npm run dev
```

Dashboard runs on `http://localhost:3000`

**Demo Login:**
- Email: `admin@hondurascoop.org`
- Password: `demo123`

### 3. Mobile App Setup

```bash
cd mobile-app
npm install

# Update API URL in src/utils/api.js
# Change API_URL to your backend URL

# Start Expo
npx expo start
```

Scan QR code with Expo Go app.

**Demo Farmer Codes:** HN-001, HN-002, HN-003, KE-001, KE-002

## 📦 Deployment

### Backend (Railway)

1. Create new Railway project
2. Add PostgreSQL database
3. Deploy from GitHub or Railway CLI:
```bash
cd backend
railway login
railway init
railway up
```
4. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (auto-set by Railway)
   - `JWT_SECRET` (generate random string)
   - `NODE_ENV=production`
   - `APP_URL` (your frontend URL)

5. Run migrations:
```bash
railway run npm run init-db
railway run npm run seed
```

### Web Dashboard (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy:
```bash
cd web-dashboard
vercel
```
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL

### Mobile App (Expo)

1. Update `src/utils/api.js` with production API URL
2. Build for production:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

Or use Expo Go for testing:
```bash
npx expo start --tunnel
```

## 🎮 Features

### Mobile App (Farmers)
- ✅ Simple login with farmer code
- ✅ Log new harvests (date, quantity, grade, variety, processing method)
- ✅ View all personal batches
- ✅ Generate QR codes for batches
- ✅ See live NY-C coffee price
- ✅ Track total harvest quantity

### Web Dashboard (Co-op Admins)
- ✅ Secure login
- ✅ Dashboard with key metrics (farmers, batches, total quantity)
- ✅ View all co-op members
- ✅ Browse all harvest batches
- ✅ Live NY-C price widget
- ✅ Export-ready data tables

### Backend API
- ✅ RESTful API with JWT authentication
- ✅ PostgreSQL database with proper indexing
- ✅ Batch QR code generation
- ✅ Coffee price endpoint (mock NY-C data)
- ✅ Multi-cooperative support
- ✅ Farmer and harvest CRUD operations

## 📊 Database Schema

### Tables
- `cooperatives`: Co-op organizations
- `users`: Admin accounts
- `farmers`: Registered farmers
- `harvest_batches`: Coffee harvest records

### Key Relationships
- Farmers belong to cooperatives
- Batches link to farmers and cooperatives
- Users are scoped to cooperatives

## 🔐 Demo Credentials

### Web Dashboard
| Email | Password | Cooperative |
|-------|----------|-------------|
| admin@hondurascoop.org | demo123 | Honduras Coop |
| admin@kenyahighlands.co.ke | demo123 | Kenya Highlands |

### Mobile App
| Farmer Code | Name | Cooperative |
|-------------|------|-------------|
| HN-001 | Carlos Martinez | Honduras |
| HN-002 | Maria Lopez | Honduras |
| HN-003 | Juan Rodriguez | Honduras |
| KE-001 | James Kimani | Kenya |
| KE-002 | Grace Wanjiru | Kenya |

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Cooperatives
- `GET /api/cooperatives` - List all cooperatives
- `GET /api/cooperatives/:id` - Get cooperative details

### Farmers
- `GET /api/farmers` - List farmers (filterable by cooperative)
- `GET /api/farmers/:id` - Get farmer details
- `POST /api/farmers` - Create new farmer (auth required)

### Batches
- `GET /api/batches` - List batches (filterable)
- `GET /api/batches/:id` - Get batch details
- `POST /api/batches` - Create new batch (auth required)
- `GET /api/batches/:id/qr` - Generate QR code

### Dashboard
- `GET /api/dashboard/stats` - Get co-op statistics (auth required)

### Price
- `GET /api/coffee-price` - Get current NY-C price

## 🧪 Testing

### Manual Testing Flow

1. **Backend**: 
   - Hit `GET /api/health` → Should return 200
   - Login as admin → Should get JWT token
   - Get batches → Should return seeded data

2. **Web Dashboard**:
   - Login with demo admin account
   - View dashboard stats
   - Check farmers and batches tables

3. **Mobile App**:
   - Login with farmer code (HN-001)
   - View existing batches
   - Log new harvest
   - Generate QR code for batch

## 📈 Next Steps (V2)

- [ ] Real-time price integration (ICE API)
- [ ] Payment tracking
- [ ] Multi-language support (Spanish, Swahili)
- [ ] Weather data integration
- [ ] Blockchain anchoring for immutability
- [ ] Export to CSV/PDF
- [ ] Push notifications
- [ ] Photo uploads for batches
- [ ] Offline-first mobile app

## 🤝 Contributing

This is a demo MVP. For production use:
1. Implement proper authentication (OAuth, 2FA)
2. Add input validation and sanitization
3. Set up proper error logging (Sentry)
4. Add comprehensive tests
5. Implement rate limiting
6. Use environment-specific configs

## 📄 License

MIT License - free to use and modify

---

**Built for:** Coffee farmers and cooperatives
**Purpose:** Transparent, traceable supply chain management
**Status:** MVP - Ready for demo and testing
