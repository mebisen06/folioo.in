# <p align="center"><img src="https://raw.githubusercontent.com/lucide-react/lucide/main/icons/sparkles.svg" width="40" height="40" alt="Folioo Logo" /><br>Folioo.in</p>

<p align="center">
  <strong>The Ultimate Developer-First Creator Platform & Portfolio Builder</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase Services" />
</p>

---

## ⚡ Overview

**Folioo** is a premium, high-fidelity developer portfolio platform and resume builder. Inspired by the sleek, minimalist aesthetics of **Vercel** and **Linear**, Folioo offers creators a gorgeous dark-mode dashboard to publish interactive portfolios, track detailed traffic analytics, build job-ready resumes, and export clean PDFs. 

The application utilizes a **modern serverless architecture** that interfaces directly with **Google Firebase** for authentication, state management, and storage, completely decoupling from legacy REST backend services.

---

## ✨ Key Features

### 📊 Creator Analytics Dashboard
- **Interactive Visualizations**: Beautiful, real-time analytics charts (Area and Bar charts) powered by **Recharts** to track views, likes, downloads, and user engagement.
- **Dynamic Portfolio CRUD**: Manage multiple portfolios, update metadata, write tags, and upload new screenshots via high-fidelity, interactive modals.

### 📝 Professional Resume Builder
- **Rich Interactive Editor**: Customize experience, education, skills, and personal information in real-time.
- **Export to PDF**: Integrated with **jsPDF** and **html2canvas** for instant, pixel-perfect resume compilation and download.

### 🎨 Premium Glassmorphic Design System
- Built on top of **Tailwind CSS v4** featuring customized design tokens (Plus Jakarta Sans, JetBrains Mono).
- Handcrafted custom components like `<Button>`, `<Card>`, `<Badge>`, and modal overlays with soft glows (`shadow-glow`), subtle border highlights, and fluid micro-animations via **Framer Motion**.

### 🔐 Secure Firebase Infrastructure & RBAC
- **Unified Auth State**: Direct integration with Firebase Authentication supporting both **Google Sign-In** and email/password authentication workflows.
- **Role-Based Access Control (RBAC)**: Distinct workspace environments for guests, registered **Creators**, and **Admins** enforced using secure server-side Cloud Firestore security rules.
- **Admin Console**: Monitor all platform activities, approve or reject portfolio listings, and manage user statuses (Active/Suspended).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19.2, TypeScript 6.0, Vite 8.0 | Dynamic, fast UI orchestration & strict type-safety |
| **Styling** | Tailwind CSS v4.0, PostCSS, Framer Motion | Modern utility-first layout, glassmorphic effects, & animations |
| **Database & Auth** | Cloud Firestore, Firebase Authentication | Secure persistent data storage & user sign-in flows |
| **Charts & Metrics** | Recharts | Render statistics, views, and downloads on dashboards |
| **PDF Generation** | jsPDF, html2canvas | Exporting user resumes directly from HTML DOM structures |
| **Icons** | Lucide React | High-quality visual indicators and navigation icons |

---

## 📂 Project Structure

```text
├── src/
│   ├── api/                  # API integration definitions (legacy/transition references)
│   ├── assets/               # Static assets & images
│   ├── components/           # UI Components
│   │   ├── ui/               # Modular custom UI widgets (Buttons, Cards, Modals, Tabs, etc.)
│   │   ├── showcase/         # Showcase components (dynamic layouts & templates)
│   │   ├── AdminDashboard    # Management portal for Admins
│   │   ├── CreatorDashboard  # Analytics & project management for Creators
│   │   ├── LandingPage       # Dynamic visitor landing page
│   │   ├── PortfolioDetails  # In-depth showcase page for individual portfolios
│   │   ├── ResumeBuilder     # Full-featured interactive builder & exporter
│   │   └── ...               # Login, Signup, UserProfile elements
│   ├── context/              # Global state contexts (AuthContext.tsx)
│   ├── hooks/                # Custom React Hooks
│   ├── services/             # Firebase integration logic (authService, portfolioService, etc.)
│   ├── types/                # Core TypeScript interfaces & types
│   ├── utils/                # Utility helpers (clsx/tailwind-merge wrapper)
│   ├── firebase.ts           # Firebase SDK initialization
│   ├── index.css             # Main stylesheet with Tailwind directives and theme overrides
│   └── main.tsx              # Application entry point
├── firestore.rules           # Server-side Firestore authorization rules
├── firestore.indexes.json    # Firestore database index definition
├── firebase.json             # Firebase configuration
├── package.json              # Script directives & dependencies
└── vite.config.ts            # Vite bundler configurations
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and a package manager (such as `npm`, `yarn`, or `bun`) installed.

### 2. Installation
Clone the repository and install the project dependencies:
```bash
# Clone the repository
git clone https://github.com/your-username/folioo-in.git
cd folioo-in

# Install dependencies using Bun (recommended) or npm
bun install
# or
npm install
```

### 3. Firebase Configuration
Make sure your Firebase configuration variables in `src/firebase.ts` are set up to point to your Firebase project:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 4. Running the Development Server
Launch the development environment:
```bash
bun run dev
# or
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 5. Build for Production
To build the application for deployment:
```bash
bun run build
# or
npm run build
```

---

## 🔒 Security Rules & Database Seeding

### Firestore Security Rules
Folioo enforces granular document rules defined in `firestore.rules`:
* **Profiles**: Users can only read and modify their own `/users/{userId}` documents. Admin-level privileges can modify all records.
* **Portfolios & Resumes**: Publicly readable, but creation/updates require owner (`creator_id == auth.uid`) authentication status.
* **Guides**: Read-only for public visitors, write-protected to Admin role only.

Deploy the rules to Firebase:
```bash
npx firebase deploy --only firestore:rules
```

### Automatic Seeding
When running the application for the first time, `portfolioService.ts` checks if the `portfolios` and `guides` collections in Cloud Firestore are empty. If empty, the system **automatically seeds** a default set of sample templates and deployment guides to populate your dashboard immediately.

---

## 🌐 Deployment

### Vercel (SPA Routing)
This project is configured with a `vercel.json` file to rewrite all routes to `index.html`, facilitating HTML5 History API routing without 404 errors:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Firebase Hosting
To deploy to Firebase Hosting, initialize Hosting in your CLI and deploy:
```bash
npx firebase deploy --only hosting
```

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
