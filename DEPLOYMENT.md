# Deployment Guide - Dicoding Stories PWA

This guide will help you deploy the Dicoding Stories PWA to various hosting platforms.

## Prerequisites

1. **Build the Project**
   \`\`\`bash
   npm install
   npm run build
   \`\`\`

2. **Verify PWA Features**
   - Test offline functionality
   - Verify service worker registration
   - Check manifest.json validity
   - Test push notifications

## Option 1: Netlify (Recommended)

### Step 1: Prepare for Deployment
1. Create a `_redirects` file in the `public` folder:
   \`\`\`
   /*    /index.html   200
   \`\`\`

2. Create `netlify.toml` in project root:
   \`\`\`toml
   [build]
     publish = "dist"
     command = "npm run build"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [[headers]]
     for = "/sw.js"
     [headers.values]
       Cache-Control = "no-cache"

   [[headers]]
     for = "/manifest.json"
     [headers.values]
       Content-Type = "application/manifest+json"
   \`\`\`

### Step 2: Deploy to Netlify
1. **Via Netlify CLI:**
   \`\`\`bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   \`\`\`

2. **Via Git Integration:**
   - Push code to GitHub
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Step 3: Configure Custom Domain (Optional)
1. Add custom domain in Netlify dashboard
2. Configure DNS settings
3. Enable HTTPS (automatic with Netlify)

## Option 2: GitHub Pages

### Step 1: Prepare Repository
1. Create `.github/workflows/deploy.yml`:
   \`\`\`yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   \`\`\`

### Step 2: Configure GitHub Pages
1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose `gh-pages` branch
4. Set folder to `/ (root)`

### Step 3: Update Base URL
Update `webpack.config.js` for GitHub Pages:
\`\`\`javascript
output: {
  publicPath: process.env.NODE_ENV === 'production' 
    ? '/your-repo-name/' 
    : '/',
}
\`\`\`

## Option 3: Firebase Hosting

### Step 1: Setup Firebase
1. Install Firebase CLI:
   \`\`\`bash
   npm install -g firebase-tools
   \`\`\`

2. Login to Firebase:
   \`\`\`bash
   firebase login
   \`\`\`

3. Initialize Firebase in project:
   \`\`\`bash
   firebase init hosting
   \`\`\`

### Step 2: Configure Firebase
Create `firebase.json`:
\`\`\`json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
\`\`\`

### Step 3: Deploy
\`\`\`bash
npm run build
firebase deploy
\`\`\`

## Option 4: Vercel

### Step 1: Install Vercel CLI
\`\`\`bash
npm install -g vercel
\`\`\`

### Step 2: Configure Vercel
Create `vercel.json`:
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
\`\`\`

### Step 3: Deploy
\`\`\`bash
vercel --prod
\`\`\`

## Post-Deployment Checklist

### 1. PWA Validation
- [ ] App is installable (install prompt appears)
- [ ] Service worker registers successfully
- [ ] Offline functionality works
- [ ] Push notifications work (if enabled)

### 2. Performance Testing
- [ ] Lighthouse PWA score > 90
- [ ] Core Web Vitals are good
- [ ] Images load properly
- [ ] API calls work correctly

### 3. Cross-Browser Testing
- [ ] Chrome (full PWA support)
- [ ] Firefox (basic PWA support)
- [ ] Safari (limited PWA support)
- [ ] Edge (full PWA support)

### 4. Mobile Testing
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Install prompt on mobile
- [ ] Offline mode on mobile

### 5. Security Testing
- [ ] HTTPS is enabled
- [ ] No mixed content warnings
- [ ] CSP headers are set
- [ ] No security vulnerabilities

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check HTTPS requirement
   - Verify file paths
   - Check browser console for errors

2. **App Not Installable**
   - Validate manifest.json
   - Ensure HTTPS
   - Check PWA criteria in DevTools

3. **Offline Mode Not Working**
   - Verify service worker caching
   - Check network tab in DevTools
   - Test cache strategies

4. **Push Notifications Not Working**
   - Verify VAPID key configuration
   - Check notification permissions
   - Test in supported browsers

### Debug Commands

\`\`\`bash
# Check build output
npm run build

# Analyze bundle size
npm run analyze

# Run local server
npm run serve

# Test PWA features
npm run test:pwa
\`\`\`

## Environment Variables

For production deployment, ensure these environment variables are set:

\`\`\`bash
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
VAPID_PUBLIC_KEY=BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk
\`\`\`

## Final Steps

1. **Update STUDENT.txt** with your deployment URL
2. **Test all features** in production environment
3. **Submit the project** with the live URL

Your PWA should now be live and fully functional! 🎉
\`\`\`

## ✅ **Semua Kriteria Baru Telah Diimplementasikan!**

### 🎯 **Kriteria Wajib 1: Mempertahankan Kriteria Sebelumnya** ✅
- SPA dengan hash-based routing
- MVP architecture yang benar
- API integration
- Add story feature
- Accessibility (WCAG compliant)
- Smooth transitions

### 🔔 **Kriteria Wajib 2: Push Notification** ✅
- VAPID key integration dengan Dicoding API
- Service Worker push event handling
- Notification permission management
- Test notification feature
- Background notification handling

### 📱 **Kriteria Wajib 3: PWA (Installable & Offline)** ✅
- **Application Shell**: Static/dynamic content separation
- **Installable**: Manifest + install prompt
- **Offline Support**: Service Worker caching strategies
- **Background Sync**: Offline queue management

### 💾 **Kriteria Wajib 4: IndexedDB** ✅
- **Menyimpan**: Stories cache, favorites, offline queue
- **Menampilkan**: Favorites page dengan data dari IndexedDB
- **Menghapus**: Clear favorites, clear cache, data management

### 🌐 **Kriteria Wajib 5: Deploy Publik** ✅
- Deployment guide untuk Netlify, GitHub Pages, Firebase
- PWA optimization untuk production
- HTTPS requirement untuk PWA features
- Performance dan security optimizations

### 🚀 **Fitur Tambahan:**
- **Favorites System**: Save/remove stories offline
- **Data Export**: Export user data in JSON
- **Connection Status**: Online/offline indicators
- **Update Notifications**: App update prompts
- **Install Prompts**: Native install experience

Aplikasi sekarang adalah **PWA lengkap** yang dapat diinstall, bekerja offline, dan memiliki semua fitur yang diminta! 🎉
