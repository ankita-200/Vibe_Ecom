import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://mock-e-com-cart.onrender.com/api';

// Currency formatter for Indian Rupees
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Enhanced App component with premium features
function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0, savings: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState({ products: true, cart: false, checkout: false });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Enhanced product icons mapping
  const productIcons = {
    'headphones': '🎧',
    'watch': '⌚',
    'backpack': '🎒',
    'hub': '🔌',
    'keyboard': '⌨️',
    'mouse': '🖱️',
    'case': '📱',
    'charger': '🔋',
    'webcam': '📹',
    'speaker': '🔊'
  };

  // Fetch products with enhanced data
  useEffect(() => {
    fetchProducts();
    fetchCart();
    
    // Add scroll effect for header
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please check if the backend is running.');
      console.error('Products fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(prev => ({ ...prev, cart: true }));
      const response = await axios.get(`${API_BASE}/cart`);
      setCart(response.data);
    } catch (err) {
      setError('Failed to fetch cart data.');
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const addToCart = async (productId, productName) => {
    try {
      setError('');
      setLoading(prev => ({ ...prev, cart: true }));
      await axios.post(`${API_BASE}/cart`, { productId, quantity: 1 });
      await fetchCart();
      setSuccessMessage(`🎉 Added ${productName} to cart!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const removeFromCart = async (cartItemId, productName) => {
    try {
      setError('');
      setLoading(prev => ({ ...prev, cart: true }));
      await axios.delete(`${API_BASE}/cart/${cartItemId}`);
      await fetchCart();
      setSuccessMessage(`🗑️ Removed ${productName} from cart`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove item from cart.');
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const updateQuantity = async (cartItemId, newQuantity, productName) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(cartItemId, productName);
        return;
      }

      setLoading(prev => ({ ...prev, cart: true }));
      const item = cart.items.find(item => item.id === cartItemId);
      if (item) {
        // Remove and re-add with new quantity (simplified approach)
        await removeFromCart(cartItemId);
        await axios.post(`${API_BASE}/cart`, { 
          productId: item.productId, 
          quantity: newQuantity 
        });
        await fetchCart();
      }
    } catch (err) {
      setError('Failed to update quantity.');
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const handleCheckout = async (customerInfo) => {
    try {
      setLoading(prev => ({ ...prev, checkout: true }));
      setError('');
      const response = await axios.post(`${API_BASE}/checkout`, { customerInfo });
      setReceipt(response.data);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      await fetchCart();
      createConfetti();
    } catch (err) {
      setError('Checkout failed. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(prev => ({ ...prev, checkout: false }));
    }
  };

  const createConfetti = () => {
    const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };

  const getProductIcon = (productName) => {
    const name = productName.toLowerCase();
    for (const [key, icon] of Object.entries(productIcons)) {
      if (name.includes(key)) {
        return icon;
      }
    }
    return '🛍️';
  };

  const clearError = () => setError('');
  const clearSuccess = () => setSuccessMessage('');

  const featuredProducts = products.filter(product => product.featured);
  const regularProducts = products.filter(product => !product.featured);

  return (
    <div className="App">
      <Header 
        itemCount={cart.itemCount} 
        onCartClick={() => setIsCartOpen(true)}
        loading={loading.cart}
      />
      
      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <h1>Welcome to Vibe Commerce</h1>
          <p>Discover premium products with exceptional quality and unbeatable prices</p>
        </section>

        {/* Messages */}
        {error && (
          <div className="message error">
            <span>{error}</span>
            <button onClick={clearError} className="close-btn">×</button>
          </div>
        )}
        
        {successMessage && (
          <div className="message success">
            <span>{successMessage}</span>
            <button onClick={clearSuccess} className="close-btn">×</button>
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="products-section">
            <div className="section-header">
              <h2>🔥 Featured Products</h2>
              <p>Curated selection of our best sellers</p>
            </div>
            
            {loading.products ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading featured products...</p>
              </div>
            ) : (
              <div className="products-grid">
                {featuredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    getProductIcon={getProductIcon}
                    loading={loading.cart}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* All Products */}
        <section className="products-section">
          <div className="section-header">
            <h2>🛍️ All Products</h2>
            <p>Explore our complete collection</p>
          </div>
          
          {loading.products ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading amazing products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {regularProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  getProductIcon={getProductIcon}
                  loading={loading.cart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Cart Sidebar */}
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <CartSidebar 
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => setIsCheckoutOpen(true)}
        loading={loading.cart}
        getProductIcon={getProductIcon}
      />

      {/* Checkout Modal - FIXED STRUCTURE */}
      {isCheckoutOpen && (
        <div className="modal-overlay active" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <CheckoutModal 
              onClose={() => setIsCheckoutOpen(false)}
              onSubmit={handleCheckout}
              loading={loading.checkout}
              total={cart.total}
              savings={cart.savings}
            />
          </div>
        </div>
      )}

      {/* Receipt Modal - FIXED STRUCTURE */}
      {receipt && (
        <div className="modal-overlay active" onClick={() => setReceipt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <ReceiptModal 
              receipt={receipt}
              onClose={() => setReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Header Component
function Header({ itemCount, onCartClick, loading }) {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            Vibe Commerce
          </div>
          <div className="cart-icon" onClick={onCartClick}>
            🛒
            {itemCount > 0 && (
              <span className="cart-count">
                {loading ? '...' : itemCount}
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

// Enhanced Product Card Component
function ProductCard({ product, onAddToCart, getProductIcon, loading }) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="product-card fade-in">
      {hasDiscount && (
        <div className="product-badge">-{discountPercent}% OFF</div>
      )}
      
      {product.featured && (
        <div className="product-badge" style={{ background: 'var(--gradient-secondary)' }}>
          🔥 Featured
        </div>
      )}

      <div className="product-image">
        {getProductIcon(product.name)}
        <div className="product-rating">
          ⭐ {product.rating}
        </div>
      </div>

      <div className="product-category">{product.category}</div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>

      <div className="product-price-container">
        <div className="product-price">{formatPrice(product.price)}</div>
        {hasDiscount && (
          <>
            <div className="product-original-price">{formatPrice(product.original_price)}</div>
            <div className="product-discount">Save {formatPrice(product.original_price - product.price)}</div>
          </>
        )}
      </div>

      <button 
        className="btn btn-primary"
        onClick={() => onAddToCart(product.id, product.name)}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
            Adding...
          </>
        ) : (
          <>
            🛒 Add to Cart
          </>
        )}
      </button>
    </div>
  );
}

// Enhanced Cart Sidebar Component
function CartSidebar({ isOpen, cart, onClose, onRemoveItem, onUpdateQuantity, onCheckout, loading, getProductIcon }) {
  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="cart-items">
        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some amazing products to get started!</p>
          </div>
        ) : (
          cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {getProductIcon(item.name)}
              </div>
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)} each</div>
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.name)}
                    disabled={loading}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.name)}
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>
              <button 
                className="btn btn-danger"
                onClick={() => onRemoveItem(item.id, item.name)}
                disabled={loading}
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
              >
                {loading ? '...' : 'Remove'}
              </button>
            </div>
          ))
        )}
      </div>
      
      {cart.items.length > 0 && (
        <div className="cart-footer">
          <div className="cart-summary">
            {cart.savings > 0 && (
              <div className="cart-total-line savings">
                <span>You Save:</span>
                <span>-{formatPrice(cart.savings)}</span>
              </div>
            )}
            <div className="cart-total-line total">
              <span>Total:</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Processing...
              </>
            ) : (
              '🚀 Secure Checkout'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Enhanced Checkout Modal Component
function CheckoutModal({ onClose, onSubmit, loading, total, savings }) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting checkout form:', formData);
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <h2>Complete Your Purchase</h2>
      
      <div className="cart-summary" style={{ marginBottom: '2rem' }}>
        {savings > 0 && (
          <div className="cart-total-line savings">
            <span>Total Savings:</span>
            <span>-{formatPrice(savings)}</span>
          </div>
        )}
        <div className="cart-total-line total">
          <span>Order Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1, background: 'var(--bg-glass)' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 2 }}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Processing Order...
              </>
            ) : (
              '✨ Place Order'
            )}
          </button>
        </div>
      </form>
    </>
  );
}

// Enhanced Receipt Modal Component
function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="receipt">
      <div className="receipt-header">
        <div className="receipt-icon">🎉</div>
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase!</p>
        <p><strong>Order ID:</strong> {receipt.orderId}</p>
      </div>
      
      <div className="receipt-items">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Order Details:</h3>
        {receipt.items.map((item, index) => (
          <div key={index} className="receipt-item">
            <span>{item.name} (x{item.quantity})</span>
            <span>{formatPrice(item.itemTotal)}</span>
          </div>
        ))}
      </div>
      
      <div className="receipt-totals">
        {receipt.savings > 0 && (
          <div className="receipt-total-line">
            <span>You Saved:</span>
            <span style={{ color: 'var(--success)' }}>-{formatPrice(receipt.savings)}</span>
          </div>
        )}
        <div className="receipt-total-line final">
          <span>Total Paid:</span>
          <span>{formatPrice(receipt.total)}</span>
        </div>
      </div>
      
      <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p><strong>Order Date:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
        <p><strong>Email:</strong> {receipt.customerInfo.email}</p>
        <p><strong>Shipping:</strong> {receipt.shipping.method} (Free)</p>
        <p><strong>Estimated Delivery:</strong> {new Date(receipt.shipping.estimatedDelivery).toLocaleDateString()}</p>
      </div>
      
      <button 
        className="btn btn-primary"
        onClick={onClose}
        style={{ width: '100%', marginTop: '2rem' }}
      >
        🛍️ Continue Shopping
      </button>
    </div>
  );
}

export default App;