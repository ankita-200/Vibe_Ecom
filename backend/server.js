const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS for production - allow all origins
app.use(cors({
  origin: true, // Allow all origins in production
  credentials: true
}));

app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:');

// Initialize database tables with enhanced schema
db.serialize(() => {
  // Products table with additional fields
  db.run(`CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    image TEXT,
    description TEXT,
    category TEXT,
    rating DECIMAL(2,1),
    featured BOOLEAN DEFAULT 0
  )`);

  // Cart table
  db.run(`CREATE TABLE cart (
    id TEXT PRIMARY KEY,
    productId INTEGER,
    quantity INTEGER,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productId) REFERENCES products(id)
  )`);

  // Insert enhanced sample products with INR prices
  const products = [
    { 
      name: 'Quantum Wireless Headphones', 
      price: 10999,
      original_price: 13299,
      description: 'Premium noise-cancelling headphones with 30hr battery life and crystal clear audio',
      category: 'Audio',
      rating: 4.8,
      featured: 1
    },
    { 
      name: 'Nexus Smart Watch', 
      price: 20749,
      original_price: 24899,
      description: 'Advanced health monitoring with ECG, GPS, and always-on display',
      category: 'Wearables',
      rating: 4.6,
      featured: 1
    },
    { 
      name: 'Voyager Laptop Backpack', 
      price: 6649,
      original_price: 8299,
      description: 'Weather-resistant backpack with dedicated laptop compartment and USB charging port',
      category: 'Accessories',
      rating: 4.4,
      featured: 0
    },
    { 
      name: 'HyperDrive USB-C Hub', 
      price: 4149,
      original_price: 5809,
      description: '7-in-1 multiport adapter with 4K HDMI, USB 3.0, and 100W PD charging',
      category: 'Electronics',
      rating: 4.7,
      featured: 0
    },
    { 
      name: 'Mechanical Pro Keyboard', 
      price: 7469,
      original_price: 9959,
      description: 'RGB mechanical keyboard with Cherry MX switches and programmable macros',
      category: 'Accessories',
      rating: 4.9,
      featured: 1
    }
  ];

  const stmt = db.prepare("INSERT INTO products (name, price, original_price, description, category, rating, featured) VALUES (?, ?, ?, ?, ?, ?, ?)");
  products.forEach(product => {
    stmt.run(product.name, product.price, product.original_price, product.description, product.category, product.rating, product.featured);
  });
  stmt.finalize();
});

// API Routes (keep your existing routes, just updating CORS)
app.get('/api/products', (req, res) => {
  const { featured } = req.query;
  let query = "SELECT * FROM products";
  let params = [];

  if (featured === 'true') {
    query += " WHERE featured = 1";
  }

  query += " ORDER BY featured DESC, rating DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(rows);
  });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, existingItem) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        db.run("UPDATE cart SET quantity = ? WHERE productId = ?", [newQuantity, productId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update cart' });
          }
          res.json({ 
            message: 'Cart updated successfully', 
            cartItemId: existingItem.id,
            action: 'updated'
          });
        });
      } else {
        const cartItemId = uuidv4();
        db.run("INSERT INTO cart (id, productId, quantity) VALUES (?, ?, ?)", 
          [cartItemId, productId, quantity], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add item to cart' });
          }
          res.json({ 
            message: 'Item added to cart', 
            cartItemId,
            action: 'added'
          });
        });
      }
    });
  });
});

app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM cart WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to remove item' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

app.get('/api/cart', (req, res) => {
  db.all(`
    SELECT 
      c.id,
      c.productId,
      c.quantity,
      p.name,
      p.price,
      p.original_price,
      p.description,
      p.category,
      (c.quantity * p.price) as itemTotal,
      (c.quantity * COALESCE(p.original_price, p.price)) as originalItemTotal
    FROM cart c
    JOIN products p ON c.productId = p.id
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }

    const total = rows.reduce((sum, item) => sum + parseFloat(item.itemTotal), 0);
    const originalTotal = rows.reduce((sum, item) => sum + parseFloat(item.originalItemTotal), 0);
    const savings = originalTotal - total;
    
    res.json({
      items: rows,
      total: parseFloat(total.toFixed(2)),
      originalTotal: parseFloat(originalTotal.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      itemCount: rows.reduce((count, item) => count + item.quantity, 0),
      discount: savings > 0 ? parseFloat(((savings / originalTotal) * 100).toFixed(1)) : 0
    });
  });
});

app.post('/api/checkout', (req, res) => {
  const { customerInfo } = req.body;

  if (!customerInfo?.name || !customerInfo?.email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  db.all(`
    SELECT 
      c.id,
      c.productId,
      c.quantity,
      p.name,
      p.price,
      p.original_price,
      (c.quantity * p.price) as itemTotal
    FROM cart c
    JOIN products p ON c.productId = p.id
  `, (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to process checkout' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.itemTotal), 0);
    const originalTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.quantity * (item.original_price || item.price)), 0);
    const orderId = `VIBE-${Date.now()}`;

    const receipt = {
      orderId,
      customerInfo,
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      originalTotal: parseFloat(originalTotal.toFixed(2)),
      savings: parseFloat((originalTotal - total).toFixed(2)),
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      shipping: {
        method: 'Standard Shipping',
        cost: 0,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    db.run("DELETE FROM cart", (err) => {
      if (err) {
        console.error('Error clearing cart:', err);
      }
    });

    res.json(receipt);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Vibe Commerce API is running on Render',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vibe Commerce Backend is running!',
    endpoints: {
      products: '/api/products',
      cart: '/api/cart',
      checkout: '/api/checkout',
      health: '/api/health'
    },
    documentation: 'Visit /api/health for API status'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vibe Commerce Backend running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
});