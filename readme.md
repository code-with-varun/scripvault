# 📊 ScripVault

ScripVault is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that allows users to manage their stock and mutual fund investments. Users can track portfolios, explore new scrips, create transactions, manage watchlists, and consult with experts — all in one platform.

---

## 🔧 Project Structure

```text
scripvault/
│
├── server/                        # Express.js Backend API
│   ├── data/                      # Initial JSON seeds (explore, etc.)
│   ├── models/                    # Mongoose Data Models (User, Investment, Transaction, etc.)
│   ├── routes/                    # API Route Handlers (auth, portfolio, explore, etc.)
│   ├── services/                  # Business logic & Market Engines
│   ├── index.js                   # Main Express server entry point
│   ├── package.json
│   └── .env                       # Backend Environment Variables (Ignored in Git)
│
├── scripvault-frontend/           # React.js Frontend App
│   ├── public/                    # Static Assets & HTML template
│   ├── src/
│   │   ├── components/            # Layout & UI Components
│   │   ├── context/               # Auth & Global Context
│   │   ├── pages/                 # Page Views (Dashboard, Explore, Portfolio, etc.)
│   │   ├── services/              # API Client Services
│   │   ├── App.js                 # Main App & Router setup
│   │   └── index.js
│   ├── package.json
│   └── .env                       # Frontend Environment Variables (Ignored in Git)
│
├── .gitignore
└── README.md
```

---

## 🚀 Features

### 🔐 User Authentication
- Register and login with email and password
- JWT-based authorization for protected routes
- Session persistence with React Context

### 📊 Dashboard & Net Worth Tracker
- Real-time summary cards for total Net Worth, Market Value, and Invested Value
- Interactive visual net worth growth chart

### 💼 Portfolio Management
- Categorized investments (Stocks, Mutual Funds, ETFs, FDs, NPS)
- Add new investments as One-time or SIP
- Full transaction history tracking (Buy/Sell operations)

### 🔍 Explore Scrips
- Explore 15+ curated scrips across financial categories
- Filter by asset types
- Live simulated price fluctuations

### 🌟 Watchlist
- Save favorite scrips from Explore directly to your personal Watchlist
- Remove scrips seamlessly

### 👤 Profile Management
- View & edit phone number, password, and postal address details

### 🧠 Ask Experts
- Post investment questions to financial advisors
- Track query status and view expert replies

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Hooks, Context API)
- **React Router v6**
- **CSS Modules / Custom CSS**
- **Axios** for API requests
- **Chart.js / Recharts** for financial visualization

### Backend
- **Node.js** & **Express.js**
- **MongoDB** with **Mongoose**
- **JSON Web Tokens (JWT)** & **Bcrypt.js**

---

## 📦 Environment Variables Configuration

Create a `.env` file in the `server/` directory and `scripvault-frontend/` directory before running:

### Backend `server/.env` (Example)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/scripvault?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend `scripvault-frontend/.env` (Example)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧪 API Endpoints Overview

| Endpoint                   | Method | Description                        | Protected |
|----------------------------|--------|------------------------------------|-----------|
| `/api/auth/register`       | POST   | Register a new user                | No        |
| `/api/auth/login`          | POST   | User authentication                | No        |
| `/api/profile`             | GET    | Fetch current user details         | Yes       |
| `/api/profile`             | PUT    | Update user details                | Yes       |
| `/api/portfolio`           | GET    | Fetch user portfolio & metrics     | Yes       |
| `/api/portfolio/invest`    | POST   | Add new investment (SIP/One-Time)  | Yes       |
| `/api/investment/:id`      | DELETE | Delete investment                  | Yes       |
| `/api/explore`             | GET    | Get all scrips                     | Yes       |
| `/api/watchlist`           | GET    | Get user's watchlist               | Yes       |
| `/api/watchlist/add`       | POST   | Add scrip to watchlist             | Yes       |
| `/api/watchlist/:id`       | DELETE | Remove scrip from watchlist        | Yes       |
| `/api/ask-experts/submit`  | POST   | Submit advisory query              | Yes       |
| `/api/transactions`        | GET    | Get user transaction history       | Yes       |

---

## ⚙️ Local Setup & Running

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```

### 2. Start the Frontend App
```bash
cd scripvault-frontend
npm install
npm start
```

---

## 📄 License & Notes
Developed as part of the Fullstack Capstone Project. All credentials and API keys must be kept private via `.env` files.

