---
description: How to deploy Kitchinz ERP to Vercel
---

Follow these steps to make your ERP project live and accessible from anywhere.

### 1. Prerequisite: GitHub Repository
Ensure your project is pushed to a GitHub repository.
- If you haven't yet, initialize git and push to a new repo.

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.

### 3. Configure Build Settings
Vercel should automatically detect Vite. Ensure these settings:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Set Environment Variables (Optional)
If you decide to move your Firebase keys from `src/firebase.js` to environment variables later, you can add them in the **Environment Variables** section of the Vercel dashboard.

### 5. Deploy
Click **Deploy**. Once finished, Vercel will provide you with a `.vercel.app` link.

### 6. PWA Installation (Mobile)
Once the site is live:
1. Open the link on your mobile phone (Chrome/Safari).
2. Tap the **Menu/Share** icon.
3. Select **Add to Home Screen**.
4. The ERP will now act like a native app on your phone.
