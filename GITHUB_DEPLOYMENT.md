# GitHub Deployment Guide - 100% Free

Deploy your grocery store application using GitHub's free services.

## 🆓 GitHub Free Services

1. **GitHub Pages** - Free static hosting (Frontend)
2. **GitHub Actions** - Free CI/CD (Testing & Deployment)
3. **GitHub Codespaces** - Free development environment

## 🚀 Method 1: GitHub Pages (Frontend) + Backend on Free Service

### Step 1: Deploy Frontend to GitHub Pages

1. **Go to your GitHub repository**
2. **Settings** → **Pages** (left sidebar)
3. **Source**: Choose **"GitHub Actions"**
4. GitHub Actions workflow will deploy automatically!

### Step 2: Deploy Backend to Free Service

Use **Render** or **Railway** for backend (both free):
- Render: https://render.com (100% free)
- Railway: https://railway.app ($5 free credit/month)

## 🔄 Method 2: GitHub Actions for CI/CD

GitHub Actions is **FREE** and powerful! I'll set up:
- ✅ Unit Testing
- ✅ Integration Testing
- ✅ E2E Testing
- ✅ Build & Deploy

## 📋 What's Included

✅ **Unit Tests** - Test individual functions/components
✅ **Integration Tests** - Test API endpoints  
✅ **E2E Tests** - Test full user flows (Playwright)
✅ **Performance Tests** - Test load/performance
✅ **GitHub Actions** - Automated testing & deployment
✅ **Test Coverage** - Code coverage reports

## 🧪 Test Commands

### Backend
```bash
cd backend
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
npm run test:performance  # Performance tests
npm run test:coverage     # With coverage
```

### Frontend
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
npm run test:coverage # With coverage
npm run test:e2e      # E2E tests
```

## 📊 View Test Results

- **GitHub Actions**: Go to **Actions** tab in your repo
- **Coverage Reports**: 
  - Backend: `backend/coverage/`
  - Frontend: `frontend/coverage/`

See `README_TESTING.md` for detailed testing guide!

