# 🛍️ Vibe Commerce - Mock Vibe E-Commerce Cart

A modern, full-stack e-commerce shopping cart application built with React, Node.js, Express, and SQLite. Features a sleek dark theme with complete cart functionality and seamless user experience.

## ✨ Features

- 🎯 **Product Catalog** - Browse featured products with detailed information
- 🛒 **Shopping Cart** - Add, remove, and update item quantities in real-time
- 💳 **Secure Checkout** - Simple checkout process with order confirmation
- 📱 **Responsive Design** - Optimized for all devices
- 🎨 **Dark Theme** - Modern glass morphism design with smooth animations
- 🇮🇳 **Indian Rupee** - Native currency support with proper formatting
- ⚡ **Fast Performance** - Optimized React components and efficient API calls

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Axios
- CSS3 with Custom Variables

**Backend:**
- Node.js
- Express.js
- SQLite
- CORS


*Application showcases a modern dark theme interface with product grid, shopping cart sidebar, and elegant checkout flow.*

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/ankita-200/Vibe_Ecom.git
cd Vibe_Ecom
```

2. **Start Backend Server**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

3. **Start Frontend Development Server**
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

4. **Open your browser** and visit `http://localhost:3000`

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/cart` | Get cart items with totals |
| `POST` | `/api/cart` | Add item to cart |
| `DELETE` | `/api/cart/:id` | Remove item from cart |
| `POST` | `/api/checkout` | Process order |
| `GET` | `/api/health` | API status check |

## 🎯 How to Use

1. **Browse Products** - View the product catalog with featured items
2. **Add to Cart** - Click "Add to Cart" on any product
3. **Manage Cart** - Click cart icon to view and manage items
4. **Adjust Quantities** - Use +/- buttons to update quantities
5. **Checkout** - Click "Secure Checkout" and fill in details
6. **Order Confirmation** - Receive receipt with order details

## 🔧 Project Structure

```
Mock-E-Com-Cart/
├── backend/
│   ├── server.js          # Express server & API routes
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   └── index.css      # Premium styling
│   └── package.json       # Frontend dependencies
└── README.md
```

- **Frontend**: Static Site deployment
- **Backend**: Web Service deployment
- **Auto-deploy** on git push to main branch

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Ankita**  
*Aspiring Full Stack Developer*

---
Built with ❤️ using React & Node.js 
