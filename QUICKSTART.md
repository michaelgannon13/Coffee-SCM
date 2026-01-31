# ⚡ Quick Start Guide

Get the Coffee Supply Chain MVP running locally in 5 minutes.

## Prerequisites

Install these first:
- **Node.js 18+**: [nodejs.org](https://nodejs.org)
- **PostgreSQL 14+**: [postgresql.org](https://www.postgresql.org/download/)
- **Expo CLI**: `npm install -g expo-cli` (for mobile app)

## 🎯 One-Command Setup

### 1. Create PostgreSQL Database

```bash
# Start PostgreSQL (if not running)
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start via Services app

# Create database
createdb coffee_supply_chain

# Or using psql:
psql -U postgres
CREATE DATABASE coffee_supply_chain;
\q
```

### 2. Backend Setup (Terminal 1)

```bash
cd backend
npm install
npm run init-db
npm run seed
npm run dev
```

✅ Backend running at `http://localhost:3001`

### 3. Web Dashboard (Terminal 2)

```bash
cd web-dashboard
npm install
npm run dev
```

✅ Dashboard at `http://localhost:3000`

**Login**: admin@hondurascoop.org / demo123

### 4. Mobile App (Terminal 3)

```bash
cd mobile-app
npm install
npx expo start
```

✅ Scan QR code with Expo Go app

**Login**: Use farmer code HN-001, HN-002, HN-003, KE-001, or KE-002

## 🧪 Test the System

1. **Web Dashboard** (`localhost:3000`):
   - Login with admin credentials
   - See 5 farmers and ~15 harvest batches
   - View live NY-C coffee price

2. **Mobile App**:
   - Login with farmer code (e.g., HN-001)
   - View your existing batches
   - Tap "Log New Harvest"
   - Fill form and submit
   - Generate QR code for a batch

3. **Verify End-to-End**:
   - Log harvest in mobile app
   - Refresh web dashboard
   - New batch should appear in the table

## 🐛 Common Issues

### "Database connection failed"

**Solution**: Update `backend/.env`:
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/coffee_supply_chain
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

### "Port 3001 already in use"

**Solution**: Change port in `backend/.env`:
```env
PORT=3002
```

Also update `web-dashboard/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### "Module not found" errors

**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Mobile app can't connect to backend

**Solution**: Start Expo with tunnel:
```bash
npx expo start --tunnel
```

Or update `mobile-app/src/utils/api.js` to use your computer's local IP:
```javascript
const API_URL = 'http://192.168.1.XXX:3001'; // Your local IP
```

## 📱 Expo Go Setup

1. **Download Expo Go**:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR Code**:
   - iOS: Use Camera app
   - Android: Use Expo Go app's "Scan QR Code" button

3. **Connect to Same Network**:
   - Ensure phone and computer are on same WiFi

## 🎨 Demo Flow

### As Farmer (Mobile)
1. Open mobile app
2. Login with `HN-001`
3. View 3 existing batches
4. Tap "Log New Harvest"
5. Enter:
   - Quantity: 250 kg
   - Grade: AA
   - Variety: Arabica Bourbon
   - Processing: Washed
6. Submit
7. View new batch in list
8. Tap batch → "Generate QR Code"
9. QR code appears (links to batch details)

### As Co-op Admin (Web)
1. Open `localhost:3000`
2. Login: admin@hondurascoop.org / demo123
3. See dashboard:
   - 5 total farmers
   - 16 batches (15 seeded + 1 new)
   - ~2,500 kg total harvest
   - Live coffee price ~$2.15/lb
4. Scroll down to see all batches and farmers

## 🔄 Reset Demo Data

To start fresh:
```bash
cd backend
npm run init-db  # Drops and recreates tables
npm run seed     # Adds demo data
```

## ⚙️ Optional Configuration

### Use Different Database Name
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/my_custom_db_name
```

### Change Backend Port
```env
# backend/.env
PORT=4000
```

```env
# web-dashboard/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Use Production API (for mobile testing)
```javascript
// mobile-app/src/utils/api.js
const API_URL = 'https://your-production-api.railway.app';
```

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check API endpoints: `http://localhost:3001/api/health`

## 💡 Tips

- Keep all 3 terminals open while developing
- Use `Ctrl+C` to stop any server
- Backend changes require restart (`npm run dev` again)
- Next.js auto-reloads on changes
- Expo auto-reloads on mobile when you save files

---

**Need help?** Check error messages in terminal or browser console.
