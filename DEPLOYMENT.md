# 🚀 Deployment Guide

Complete guide for deploying the Coffee Supply Chain MVP to production.

## Overview

- **Backend**: Railway (with PostgreSQL)
- **Web Dashboard**: Vercel
- **Mobile App**: Expo (development) or EAS Build (production)

## 1️⃣ Backend Deployment (Railway)

### Option A: GitHub Integration (Recommended)

1. **Push code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy

3. **Add PostgreSQL**:
   - In your Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

4. **Set Environment Variables**:
   - Go to project → Variables
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=generate-a-strong-random-string-here
     PORT=3001
     APP_URL=https://your-frontend.vercel.app
     ```

5. **Initialize Database**:
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and link project
   railway login
   railway link
   
   # Run database setup
   railway run npm run init-db
   railway run npm run seed
   ```

6. **Get your backend URL**:
   - Go to Settings → Generate Domain
   - Note the URL (e.g., `https://coffee-api.railway.app`)

### Option B: Railway CLI

```bash
cd backend
railway login
railway init
railway up

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set JWT_SECRET=your-secret-here
railway variables set NODE_ENV=production

# Initialize database
railway run npm run init-db
railway run npm run seed
```

### Verify Backend

Visit `https://your-backend-url.railway.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 2️⃣ Web Dashboard Deployment (Vercel)

### Option A: Vercel CLI

```bash
cd web-dashboard

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - What's your project's name? coffee-supply-chain-dashboard
# - In which directory is your code located? ./
# - Override settings? N

# After deployment, set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter your Railway backend URL when prompted
# Select all environments (Production, Preview, Development)

# Redeploy to apply environment variable
vercel --prod
```

### Option B: GitHub Integration

1. Push code to GitHub (if not already done)
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: `web-dashboard`
   - Environment Variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
6. Click "Deploy"

### Verify Web Dashboard

Visit your Vercel URL (e.g., `https://coffee-dashboard.vercel.app`)

Login with:
- Email: `admin@hondurascoop.org`
- Password: `demo123`

## 3️⃣ Mobile App Deployment

### Development (Expo Go)

1. **Update API URL**:
   Edit `mobile-app/src/utils/api.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.railway.app';
   ```

2. **Start Expo with tunnel**:
   ```bash
   cd mobile-app
   npx expo start --tunnel
   ```

3. **Share QR code** for testing on physical devices

### Production Build (EAS Build)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**:
   ```bash
   cd mobile-app
   eas login
   eas build:configure
   ```

3. **Update API URL in code**:
   ```javascript
   // src/utils/api.js
   const API_URL = 'https://your-backend-url.railway.app';
   ```

4. **Build for Android**:
   ```bash
   eas build --platform android --profile preview
   ```

5. **Build for iOS** (requires Apple Developer account):
   ```bash
   eas build --platform ios --profile preview
   ```

6. **Download and install** the built APK/IPA

### Alternative: Expo Updates

For quick updates without rebuilding:
```bash
eas update --branch production --message "Updated API endpoint"
```

## 🔐 Environment Variables Summary

### Backend (Railway)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://... (auto-set by Railway)
JWT_SECRET=your-strong-secret-key
APP_URL=https://your-frontend-url.vercel.app
```

### Web Dashboard (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Mobile App (Hardcoded in src/utils/api.js)
```javascript
const API_URL = 'https://your-backend-url.railway.app';
```

## 📋 Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Database has seeded data
- [ ] Web dashboard login works
- [ ] Dashboard shows farmers and batches
- [ ] Mobile app connects to backend
- [ ] Mobile app can log new harvests
- [ ] QR code generation works
- [ ] Coffee price widget displays

## 🐛 Troubleshooting

### Backend Issues

**Database connection fails:**
```bash
# Check Railway PostgreSQL status
railway status

# View logs
railway logs
```

**CORS errors:**
Add your frontend URL to CORS whitelist in `server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}));
```

### Web Dashboard Issues

**API calls fail:**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend is running and accessible
- Check browser console for errors

**Build fails:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Mobile App Issues

**Can't connect to API:**
- Verify API_URL in `src/utils/api.js`
- Check if backend allows CORS from mobile
- Use `--tunnel` flag with Expo for local testing

**App won't build:**
```bash
# Clear Expo cache
npx expo start --clear

# Reset dependencies
rm -rf node_modules
npm install
```

## 🔄 Continuous Deployment

### Auto-deploy on Git push

**Railway (Backend)**:
- Push to `main` branch → Railway auto-deploys
- Check deployment status in Railway dashboard

**Vercel (Web)**:
- Push to `main` → Production deployment
- Push to other branches → Preview deployments

### Manual Deployment

```bash
# Backend
railway up

# Web Dashboard
vercel --prod

# Mobile (OTA update)
cd mobile-app
eas update --branch production
```

## 💰 Cost Estimates

### Free Tier Limits

- **Railway**: $5 free credit/month (renews monthly)
  - Sufficient for MVP with moderate traffic
  - PostgreSQL included

- **Vercel**: Free for hobby projects
  - 100 GB bandwidth/month
  - Unlimited deployments

- **Expo**: Free for development
  - EAS Build: Limited free builds/month
  - Production apps: Consider paid tier

### Scaling Considerations

For production with real users:
- Railway: ~$20-50/month (hobby tier)
- Vercel: Free tier usually sufficient
- Expo: $29-99/month for EAS builds and updates

## 🎉 Success!

Your Coffee Supply Chain MVP should now be live at:
- Backend API: `https://your-backend.railway.app`
- Web Dashboard: `https://your-dashboard.vercel.app`
- Mobile App: Expo Go or built APK/IPA

Demo the system:
1. Login to web dashboard as admin
2. Open mobile app on phone
3. Log a harvest as farmer
4. Refresh web dashboard to see new batch
5. Generate QR code in mobile app
6. Show end-to-end traceability

---

**Questions?** Check logs:
- Railway: `railway logs`
- Vercel: Dashboard → Deployments → Logs
- Expo: Check terminal output
