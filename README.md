# UMoney - Team Dashboard

A modern mobile-first web application for managing team referrals, deposits, and commissions.

## Features

- 🔐 User Authentication (Firebase)
- 💰 Deposit & Withdrawal Management
- 👥 Multi-level Team Referral System (3 levels)
- 📊 Real-time Dashboard
- 🎨 Modern UI with Tailwind CSS
- 📱 Mobile-first Responsive Design
- 👨‍💼 Admin Panel

## Prerequisites

- Node.js (v16 or higher)
- Firebase Account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable **Authentication** → Email/Password sign-in method
4. Enable **Firestore Database** → Start in production mode
5. Go to **Project Settings** → **General** → **Your apps**
6. Click on the **Web** icon to add a web app
7. Copy the Firebase configuration

### 3. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Admin Credentials

- **Email:** admin@gmail.com
- **Password:** admin

## Project Structure

```
├── components/          # React components
│   ├── Home.jsx        # Home dashboard
│   ├── LoginScreen.jsx # Authentication
│   ├── TeamScreen.jsx  # Team management
│   ├── DepositScreen.jsx
│   ├── WithdrawScreen.jsx
│   ├── ToolScreen.jsx
│   ├── AssetsScreen.jsx
│   ├── AdminPanel.jsx  # Admin dashboard
│   └── BottomNav.jsx   # Navigation
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── firebase.js         # Firebase configuration & services
├── App.jsx            # Main app component
├── index.jsx          # Entry point
└── index.html         # HTML template
```

## Firestore Database Structure

### Collections

1. **users** - User profiles
   - uid, email, inrBalance, usdtBalance, referralCode, referrerId, createdAt, lastLocation

2. **transactions** - All transactions
   - userId, type, amount, status, date, upiId, screenshot, etc.

3. **system** - System settings
   - settings document with usdtRate, maintenanceMode, adminUpi, etc.

## Features Overview

### User Features
- Register with referral code
- Deposit funds (INR/USDT)
- Withdraw earnings
- View team statistics
- Track commissions (3-level: 10%, 5%, 2%)

### Admin Features
- Approve/Reject deposits & withdrawals
- Manage users (ban/unban)
- View all transactions
- Configure system settings
- Maintenance mode toggle

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Technologies Used

- **React 19** - UI Framework
- **Vite** - Build tool
- **Firebase** - Backend (Auth + Firestore)
- **Tailwind CSS** - Styling
- **React Router** - Routing

## License

Private Project
