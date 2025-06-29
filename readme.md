# 📊 ScripVault

ScripVault is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that allows users to manage their stock and mutual fund investments. Users can create investment goals, track portfolios, explore new scrips, and consult with experts — all in one platform.

---

## 🔧 Project Structure

scripvault/
│
├── backend/
│ ├── controllers/ # Business logic for each route
│ ├── models/ # Mongoose schemas (User, Portfolio, Investment, etc.)
│ ├── routes/ # Express route handlers
│ ├── middleware/ # Authentication middleware
│ ├── server.js # Express server entry point
│ └── .env # Environment variables (not pushed to Git)
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Auth/ # Login, Register
│ │ │ ├── Dashboard/ # Profile, Portfolio, Explore, Watchlist, Ask Experts
│ │ │ ├── Layout/ # Header, NavMenu, Content, Footer
│ │ ├── App.js
│ │ ├── Routes.js
│ │ ├── index.js
│ │ └── index.css
│ └── .env # Frontend environment file
│
├── .gitignore
├── README.md
└── package.json


---

## 🚀 Features

### 🔐 User Authentication
- Register and login with email and password
- JWT-based authentication
- Protected routes using middleware

### 📊 Dashboard
- View total net worth
- Access to investments, explore, watchlist, profile, and expert advice

### 💼 Portfolio Management
- View mutual funds and stocks grouped by category
- Add investments as One-time or SIP
- Track performance

### 🔍 Explore Scrips
- Fake stock API for demonstration
- Add new scrips to portfolio or watchlist

### 🌟 Watchlist
- Add stocks to watchlist from Explore
- View them separately

### 👤 Profile Settings
- Update phone, password, and address

### 🧠 Ask Experts
- Post investment-related queries
- View in admin panel (simplified for demo)

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router v6+
- CSS / custom styling
- Axios for API communication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

---

## 🧪 Testing APIs

Use [ThunderClient](https://www.thunderclient.com/) or Postman to test backend APIs.

### Base URL: `http://localhost:3000/api`

| Endpoint                | Method | Description                      |
|------------------------|--------|----------------------------------|
| `/register`            | POST   | User registration                |
| `/login`               | POST   | User login                       |
| `/profile`             | GET    | Fetch profile details            |
| `/portfolio`           | GET    | Get user portfolio               |
| `/portfolio/invest`    | POST   | Add investment                   |
| `/investment/:id`      | GET    | Get single investment            |
| `/investment/:id`      | PUT    | Update investment                |
| `/investment/:id`      | DELETE | Delete investment                |
| `/explore/add`         | POST   | Add a new scrip/stock            |
| `/watchlist`           | GET    | Get user's watchlist             |
| `/watchlist/add`       | POST   | Add stock to watchlist           |
| `/ask-experts/submit`  | POST   | Submit an expert query           |

> 🔐 Most routes require an `Authorization: Bearer <token>` header.

---

## 📦 Environment Variables

### Frontend `.env`
REACT_APP_API_URL=http://localhost:3000/api


### Backend `.env`
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=3000


---

## ✅ To Run This Project

### Backend

```bash
cd backend
npm install
npm start
Frontend
cd frontend
npm install
npm start
Make sure both frontend and backend servers are running.

📌 Git Setup
.gitignore
gitignore
Copy
Edit
# Node modules
node_modules/
frontend/node_modules/
backend/node_modules/

# Env files
.env
frontend/.env
backend/.env
📞 Contact
For queries or support, reach out to the project creator: Varun Akshay

📃 License
This project is for learning/demo purposes. Please do not use it in production without proper testing and security enhancements.

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router v6+
- CSS / custom styling
- Axios for API communication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

---

## 🧪 Testing APIs

Use [ThunderClient](https://www.thunderclient.com/) or Postman to test backend APIs.

### Base URL: `http://localhost:3000/api`

| Endpoint                | Method | Description                      |
|------------------------|--------|----------------------------------|
| `/register`            | POST   | User registration                |
| `/login`               | POST   | User login                       |
| `/profile`             | GET    | Fetch profile details            |
| `/portfolio`           | GET    | Get user portfolio               |
| `/portfolio/invest`    | POST   | Add investment                   |
| `/investment/:id`      | GET    | Get single investment            |
| `/investment/:id`      | PUT    | Update investment                |
| `/investment/:id`      | DELETE | Delete investment                |
| `/explore/add`         | POST   | Add a new scrip/stock            |
| `/watchlist`           | GET    | Get user's watchlist             |
| `/watchlist/add`       | POST   | Add stock to watchlist           |
| `/ask-experts/submit`  | POST   | Submit an expert query           |

> 🔐 Most routes require an `Authorization: Bearer <token>` header.

---

## 📦 Environment Variables

### Frontend `.env`
REACT_APP_API_URL=http://localhost:3000/api


### Backend `.env`
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=3000


---

## ✅ To Run This Project

### Backend

---
