# Claude Collaboration Log

## Project Overview

**Project Name**: NewsSystemPro
**Project Type**: News Management System
**Tech Stack**: React + Vite + Ant Design + Redux + json-server
**Deployment**:
- Frontend: GitHub Pages (https://jye10032.github.io/NewsSystemPro/)
- Backend: Vercel Serverless (https://news-system-pro.vercel.app)

---

## Requirements Log

### 2024-11-24

#### 1. CI/CD Performance Optimization
**Requirement**: Fix CI/CD test timeout issue (Node.js 18.x stuck at test step for 39 minutes)

**Completed**:
- Removed Node.js 18.x, kept only 20.x
- Optimized Vitest configuration: used fork mode instead of threads
- Merged test steps to avoid duplicate runs
- Reduced test time from 39 minutes to 2 minutes

#### 2. GitHub Pages Deployment Fix
**Requirement**: Fix white screen and routing errors after deployment

**Completed**:
- Configured React Router basename to `/NewsSystemPro`
- Fixed Vite base path configuration (changed from object to function form)
- Added 404.html for SPA routing support
- Added index.html redirect script

#### 3. Vercel Backend Deployment
**Requirement**: Deploy json-server backend to Vercel, solve production environment data access issues

**Issues Encountered**:
- ES Module vs CommonJS conflict
- `require is not defined in ES module scope` error
- json-server dependency not properly installed

**Solution**:
- Created `api/index.cjs` file (using .cjs extension to force CommonJS mode)
- Moved json-server from devDependencies to dependencies
- Configured vercel.json routing correctly

#### 4. axios Browser Compatibility Issue (In-depth Investigation)
**Requirement**: Fix `Cannot destructure property 'Request' of 'undefined'` error in production

**Problem Process**:
1. First attempt: Upgrade axios 1.3.1 → 1.13.2 (failed)
2. Added polyfill to src/polyfills.js (failed, module loading order issue)
3. Moved polyfill to HTML head (failed, CI cache issue)
4. Disabled CI npm cache (partially successful)

**Final Solution**:
- **Downgraded** axios: 1.13.2 → 1.7.7
- Added HTML polyfill as extra protection
- Locked version number to prevent auto-upgrade

**Root Cause**:
- axios 1.7.7 (2024-08-31): Uses safe `typeof` checks
- axios 1.8.0+ (2025-02-26): Regression, reintroduced unsafe destructuring (PR #7003)
- axios 1.13.2: Still has the issue

**Analysis Documents**:
- AXIOS_VERSION_ANALYSIS.md - Version comparison
- AXIOS_REQUEST_DESTRUCTURE_ANALYSIS.md - Destructuring issue deep dive
- WHY_NEW_AXIOS_USES_DESTRUCTURE.md - Why new version regressed
- AXIOS_ISSUE_PR_GUIDE.md - PR contribution guide
- AXIOS_ISSUE_SEARCH_REPORT.md - GitHub Issue search results

**Open Source Contribution**:
- Submitted Issue #7259 to axios repository
- Prepared complete PR fix solution

#### 5. Git History Cleanup
**Requirement**: Remove Claude Co-Authored-By signature from commit messages

**Completed**:
- Used git filter-branch to rewrite recent commit history
- Preserved original timestamps and author information

---

### 2024-11-25

#### 6. Branch Management and Deployment Strategy
**Requirement**: Create clear branch structure, separate development and production environments

**Completed**:
- Created `production` branch from commit `112f986` (for Vercel deployment)
- Created `develop` branch from commit `112f986` (for daily development)
- Configured Vercel to monitor `production` branch

**Branch Strategy**:
```
production  ← Vercel auto-deployment (stable version)
    ↑
  main      ← GitHub Pages deployment (integration branch)
    ↑
 develop    ← Daily development (recommended working branch)
```

**Documentation**: VERCEL_BRANCH_SETUP.md

#### 7. Local Development and Production Environment Separation
**Problem**: After adapting to Vercel, local development environment couldn't run
- Router basename error: `<Router basename="/NewsSystemPro">` couldn't match local `/`
- json-server configuration conflicted with Vercel Serverless

**Solution**:

1. **Created local development-only server**:
   - Added `server.local.cjs` (for local development only)
   - Kept `api/index.cjs` (for Vercel only)

2. **Modified package.json scripts**:
   ```json
   {
     "server": "node server.local.cjs",
     "server:watch": "nodemon server.local.cjs",
     "start": "concurrently \"npm run dev\" \"npm run server\"",
     "vercel-dev": "vercel dev"
   }
   ```

3. **Automatic basename switching**:
   ```javascript
   // src/main.jsx
   const basename = import.meta.env.MODE === 'production'
     ? '/NewsSystemPro'
     : '/'
   ```

4. **Automatic environment variable loading**:
   - `.env.development`: `VITE_API_BASE_URL=http://localhost:8000`
   - `.env.production`: `VITE_API_BASE_URL=https://news-system-pro.vercel.app`

**Architecture Comparison**:

| Feature | Local Development | Vercel Production |
|---------|------------------|-------------------|
| Frontend Server | Vite Dev (3000/5173) | GitHub Pages |
| Backend Server | json-server (8000) | Serverless Function |
| Backend File | `server.local.cjs` | `api/index.cjs` |
| basename | `/` | `/NewsSystemPro` |
| API URL | localhost:8000 | news-system-pro.vercel.app |

**Documentation**:
- LOCAL_DEV_SETUP.md - Local development and production separation guide
- ENVIRONMENT_CONFIG.md - Environment auto-switching configuration
- DEVELOPMENT_WORKFLOW.md - Development workflow guide

#### 8. Development Workflow Established
**Current Branch**: `develop` ✅

**Daily Development Process**:
```bash
# 1. Daily development (on develop branch)
git checkout develop
npm start
# ... develop, commit ...
git add .
git commit -m "feat: new feature"
git push origin develop

# 2. Release to GitHub Pages
git checkout main
git merge develop
git push origin main

# 3. Deploy to Vercel production
git checkout production
git merge main
git push origin production

# 4. Return to development branch
git checkout develop
```

**Commit Message Convention**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation update
- `style:` - Style adjustment
- `refactor:` - Refactoring
- `perf:` - Performance optimization
- `test:` - Testing
- `chore:` - Build/tooling

---

## Project Architecture

### Branch Structure

```
production (112f986)  ← Vercel production deployment
    ↑
  main (1a69a3e)      ← GitHub Pages deployment, latest stable
    ↑
 develop (1a69a3e)    ← Current development branch ★
```

### Frontend (GitHub Pages)
- **URL**: https://jye10032.github.io/NewsSystemPro/
- **Build Tool**: Vite
- **Environment Variables**: `.env.production` configures backend API address
- **Auto Deployment**: Triggered by push to `main` branch

### Backend (Vercel)
- **URL**: https://news-system-pro.vercel.app
- **Technology**: json-server + Vercel Serverless Functions
- **Entry File**: `api/index.cjs` (production only)
- **Data Source**: `db/db.json` and `db/news.json`
- **Auto Deployment**: Triggered by push to `production` branch

### Local Development
- **Frontend**: http://localhost:3000 or http://localhost:5173
- **Backend**: http://localhost:8000
- **Server File**: `server.local.cjs` (development only)
- **Environment Variables**: `.env.development`

### Environment Configuration Comparison

| Configuration | Development | Production |
|---------------|-------------|------------|
| basename | `/` | `/NewsSystemPro` |
| API URL | localhost:8000 | news-system-pro.vercel.app |
| Backend Server | server.local.cjs | api/index.cjs |
| Deployment | Local run | Auto-deploy |

---

## Testing System

### Framework
- **Test Framework**: Vitest + Testing Library
- **Coverage Tool**: @vitest/coverage-v8

### Test Commands
```bash
npm run test          # Interactive testing
npm run test:run      # Single run
npm run test:coverage # Generate coverage report
npm run test:ui       # Visual interface
```

### Current Coverage
- Redux Reducers: 100%
- Login Component: 86.66%
- Overall Coverage: 92%

---

## TODO List

### Current Status
- ✅ Local development environment configured
- ✅ Branch management strategy established
- ✅ Environment auto-switching configured
- ⏳ Waiting for axios Issue #7259 maintainer response

### Daily Development
Develop on `develop` branch:
```bash
git checkout develop
npm start
```

### Next Deployment Checklist
- [ ] Change Production Branch to `production` in Vercel Dashboard
- [ ] Verify GitHub Pages deployment works
- [ ] Verify Vercel deployment works
- [ ] Test complete user login flow
- [ ] Verify news management functionality

### Future Optimization
- [ ] Optimize bundle size (currently main bundle 2MB+)
- [ ] Implement code splitting (using dynamic import)
- [ ] Add more unit tests
- [ ] Improve ESLint configuration
- [ ] Consider using real database instead of json-server

---

## Reference Resources

- **Original Project**: https://github.com/Jye10032/NewsSystem

### Core Documentation
- **README.md**: Project overview
- **DEVELOPMENT_WORKFLOW.md**: Development workflow guide ⭐
- **LOCAL_DEV_SETUP.md**: Local development and production separation guide
- **ENVIRONMENT_CONFIG.md**: Environment auto-switching configuration

### Deployment Related
- **VERCEL_DEPLOY_GUIDE.md**: Vercel deployment detailed guide
- **VERCEL_BRANCH_SETUP.md**: Branch management and Vercel configuration
- **DEPLOYMENT.md**: Deployment overview

### Testing Related
- **TESTING_GUIDE.md**: Testing framework and best practices
- **CI_CD_GUIDE.md**: CI/CD configuration guide

### axios Issue Analysis
- **AXIOS_VERSION_ANALYSIS.md**: axios version comparison analysis
- **AXIOS_REQUEST_DESTRUCTURE_ANALYSIS.md**: Destructuring issue deep dive
- **WHY_NEW_AXIOS_USES_DESTRUCTURE.md**: Why new version regressed
- **AXIOS_ISSUE_PR_GUIDE.md**: Issue and PR preparation guide
- **AXIOS_ISSUE_SEARCH_REPORT.md**: GitHub Issue search results
- **AXIOS_PR_STEP_BY_STEP.md**: Complete PR submission process

### Open Source Contribution
- **axios Issue #7259**: https://github.com/axios/axios/issues/7259

---

## Important Notes

### Development Related
1. **Current Working Branch**: `develop` ⭐
   - Please develop on `develop` branch for daily work
   - Don't modify code directly on `production` branch

2. **Start Development Environment**:
   ```bash
   npm start  # Start both frontend and backend
   # or
   npm run server  # Backend
   npm run dev     # Frontend
   ```

3. **Environment Auto-Switching**:
   - Development: basename `/`, API `localhost:8000`
   - Production: basename `/NewsSystemPro`, API `news-system-pro.vercel.app`

### Configuration Related
4. **package.json**: Contains `"type": "module"`, all .js files default to ES Module

5. **Server Files**:
   - `server.local.cjs`: Local development only
   - `api/index.cjs`: Vercel production deployment only

6. **Vercel Deployment**: Use .cjs extension to avoid ES Module conflicts

### Deployment Related
7. **Branch-Deployment Mapping**:
   - `develop` → No auto-deployment (development only)
   - `main` → GitHub Pages auto-deployment
   - `production` → Vercel auto-deployment

8. **Release Process**:
   ```bash
   develop → main → production
   (dev)     (test)  (prod)
   ```

9. **Cache Cleanup**:
   - Browser: Force refresh (Ctrl+Shift+R)
   - Vite: `rm -rf node_modules/.vite`

### Version Management
10. **axios Version**: Locked at 1.7.7
    - Don't upgrade to 1.8.0+ (regression bug exists)
    - Issue #7259 submitted, waiting for fix

11. **Commit Message**: Follow conventional commits specification
    - feat/fix/docs/style/refactor/perf/test/chore

### Claude Collaboration Rules

12. **Documentation Output**: After every code modification, output a documentation file to `diary/` folder
    - File naming: `YYYY-MM-DD-feature-name.md`
    - Content should include: background, changes made, code snippets, data flow, and follow-up tasks

---

_Last Updated: 2024-12-18_
