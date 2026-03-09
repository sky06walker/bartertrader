# BarterTrader 🔄

BarterTrader is a modern React/Vite web application that allows users to list items they own and trade them for items they want. It is powered by Firebase Authentication and Firestore.

## 🌟 Core Features

- **Google OAuth & Secure Login:** Sign up via Email/Password or Google OAuth. Profile completion (Phone Number) is strictly enforced via route protection.
- **Marketplace & Shopping Cart:** Browse dynamic item listings from other traders. Add items to your cart, specify exactly how many quantities you wish to exchange using direct number inputs, and confirm trades.
- **Item Management:** Create, Read, Update, and Delete your own listings, complete with image uploading and "Wants in Exchange" specifications.
- **Trade Summaries:** View beautiful, printable summaries of your confirmed exchanges with seller contact information.

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router DOM, Vite
- **Backend/DB:** Firebase Authentication, Cloud Firestore
- **Styling:** Custom Vanilla CSS with CSS Variables for a premium dark-mode aesthetic.

## 🚀 Deployment Guide (Cloudflare Pages)

Follow these steps to deploy the application to Cloudflare Pages:

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Build the Production Bundle:**
   Compile the React application using Vite:

   ```bash
   npm run build
   ```

   _This automatically generates the optimized static files into the `dist` folder. The `public/_redirects` file is used to ensure React Router works correctly._

3. **Deploy via Wrangler CLI:**
   Use the Cloudflare CLI tool to push your `dist` folder:
   ```bash
   npx wrangler pages deploy dist --project-name bartertrader
   ```

## ⚙️ Environment Configuration

When deploying via Cloudflare, do not hardcode your Firebase configuration. Instead, set the following environment variables in your Cloudflare Pages dashboard (**Settings > Environment variables**):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
