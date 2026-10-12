import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

const categories = ['All', 'Meals', 'Snacks', 'Drinks']

const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
})

const dateTime = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('campusEatsCart') || '[]')
    return Array.isArray(stored)
      ? stored.filter(
          (item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantity) && item.quantity > 0,
        )
      : []
  } catch {
    return []
  }
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <path d="m5 12 14 0m-6-6 6 6-6 6" />,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7" /><path d="M10 11v5m4-5v5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.4 0 2.5-1.1 2.5-2.5 0-1.8-1.5-2.5-1.5-4 0-.8.4-1.5 1-2C10.5 9.5 8 11.5 8 14.5c0 .3.2.7.5 1Z" />,
    utensils: <path d="M18 2v20M6 2v7a3 3 0 0 0 3 3v10M10 2v6" />,
  }

  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name] || paths.check}
    </svg>
  )
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </span>
  )
}

function FoodVisual({ item }) {
  const metaByCategory = {
    Meals: { icon: '🍛', tag: 'Hot Meal', prep: '10–15 min', bg: '#ecfdf5', badgeColor: '#047857' },
    Snacks: { icon: '🥪', tag: 'Fast Snack', prep: '5–8 min', bg: '#fef3c7', badgeColor: '#b45309' },
    Drinks: { icon: '🧋', tag: 'Chilled Drink', prep: '2–4 min', bg: '#e0f2fe', badgeColor: '#0369a1' },
  }
  const meta = metaByCategory[item.category] || metaByCategory.Meals

  return (
    <div className="dish-banner" style={{ background: meta.bg }}>
      <div className="dish-emoji-wrapper">
        <span className="dish-emoji" role="img" aria-label={item.name}>{meta.icon}</span>
      </div>
      <div className="dish-badge-row">
        <span className="dish-type-badge" style={{ color: meta.badgeColor }}>{meta.tag}</span>
        <span className="dish-prep-time"><Icon name="clock" size={13} /> {meta.prep}</span>
      </div>
    </div>
  )
}

function Header({ cartCount, onCart, onHome, onMenu, onOrders, onAccount, user }) {
  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <button className="navbar-brand" type="button" onClick={onHome} aria-label="CampusEats home">
          <BrandMark />
          <div className="brand-text">
            <strong>CampusEats</strong>
            <span>SLIIT Canteen Portal</span>
          </div>
        </button>

        <nav className="navbar-links" aria-label="Primary navigation">
          <button type="button" className="nav-btn" onClick={onMenu}>Today's Menu</button>
          <button type="button" className="nav-btn" onClick={onOrders}>My Order History</button>
        </nav>

        <div className="navbar-actions">
          <button className="auth-pill-btn" type="button" onClick={onAccount}>
            <Icon name="user" size={17} />
            <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
          </button>
          <button className="cart-pill-btn" type="button" onClick={onCart} aria-label={`Open tray with ${cartCount} items`}>
            <Icon name="bag" size={18} />
            <span className="cart-pill-text">My Tray</span>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function MenuCard({ item, onAdd }) {
  return (
    <article className="food-item-card">
      <FoodVisual item={item} />
      <div className="food-item-content">
        <div className="food-header-row">
          <span className="food-category-pill">{item.category}</span>
          <span className="food-id-tag">#{String(item.id).padStart(2, '0')}</span>
        </div>
        <h3 className="food-title">{item.name}</h3>
        <p className="food-desc">{item.description}</p>
        <div className="food-footer-row">
          <div className="food-price-wrap">
            <span className="price-label">Price</span>
            <strong className="food-price">{currency.format(item.price)}</strong>
          </div>
          <button type="button" className="add-cart-btn" onClick={() => onAdd(item)}>
            <Icon name="plus" size={16} /> Add to Tray
          </button>
        </div>
      </div>
    </article>
  )
}

function MenuSkeletons() {
  return (
    <div className="menu-grid-layout" aria-label="Loading menu" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="food-item-card skeleton-card" key={index}>
          <div className="skeleton skeleton-banner" />
          <div className="food-item-content">
            <span className="skeleton skeleton-pill" />
            <span className="skeleton skeleton-title" />
            <span className="skeleton skeleton-desc" />
            <span className="skeleton skeleton-price" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CartDrawer({ items, isOpen, isSubmitting, onClose, onExplore, onQuantity, onRemove, onCheckout }) {
  const subtotal = items.reduce((sum, line) => sum + (line.price * line.quantity), 0)

  return (
    <>
      <div className={`canteen-scrim ${isOpen ? 'active' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`tray-sidebar ${isOpen ? 'open' : ''}`} aria-label="Order Tray" aria-hidden={!isOpen}>
        <div className="tray-top-bar">
          <div className="tray-heading">
            <h2>Order Tray</h2>
            <span className="item-count-label">{items.length} items selected</span>
          </div>
          <button type="button" className="close-tray-btn" onClick={onClose} aria-label="Close Tray">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="tray-body">
          {items.length === 0 ? (
            <div className="empty-tray-view">
              <span className="empty-tray-icon">🍱</span>
              <h3>Your tray is empty</h3>
              <p>Explore the cafeteria menu and add meals for instant counter pickup.</p>
              <button type="button" className="canteen-primary-btn" onClick={onExplore}>Explore Menu</button>
            </div>
          ) : (
            <ul className="tray-item-list">
              {items.map((line) => (
                <li className="tray-item-row" key={line.id}>
                  <div className="tray-item-info">
                    <span className="tray-item-category">{line.category}</span>
                    <h4 className="tray-item-title">{line.name}</h4>
                    <span className="tray-item-price">{currency.format(line.price)}</span>
                  </div>
                  <div className="tray-action-col">
                    <div className="tray-qty-selector">
                      <button type="button" onClick={() => onQuantity(line.id, line.quantity - 1)} aria-label="Decrease">
                        <Icon name="minus" size={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => onQuantity(line.id, line.quantity + 1)} aria-label="Increase">
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                    <button type="button" className="trash-item-btn" onClick={() => onRemove(line.id)} aria-label="Remove">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="tray-footer">
            <div className="pickup-notice">
              <span>📍 SLIIT Main Canteen • Ground Floor Counter</span>
            </div>
            <div className="subtotal-display">
              <span>Total Payable</span>
              <strong>{currency.format(subtotal)}</strong>
            </div>
            <p className="pay-note">Payment is collected at counter upon order collection.</p>
            <button type="button" className="canteen-primary-btn checkout-full-btn" disabled={isSubmitting} onClick={onCheckout}>
              {isSubmitting ? 'Confirming Order...' : 'Confirm Pre-Order'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

function AuthModal({ mode, isOpen, error, isSubmitting, onClose, onMode, onSubmit, user, onLogout }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  return (
    <div className="auth-overlay-backdrop">
      <div className="auth-dialog-card" role="dialog" aria-modal="true">
        <button type="button" className="auth-close-x" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" size={18} />
        </button>

        {user ? (
          <div className="student-profile-panel">
            <div className="user-avatar-circle">
              <Icon name="user" size={32} />
            </div>
            <h2>Signed In As</h2>
            <strong className="student-name">{user.name}</strong>
            <span className="student-email">{user.email}</span>
            <div className="student-role-pill">Role: {user.role || 'Student'}</div>
            <button type="button" className="canteen-secondary-btn logout-btn" onClick={onLogout}>Sign Out</button>
          </div>
        ) : (
          <div className="auth-form-wrap">
            <div className="auth-title-row">
              <BrandMark />
              <h2>{mode === 'login' ? 'Student Sign In' : 'Create Canteen Account'}</h2>
            </div>
            <p className="auth-subtext">Access your pre-orders, token history, and quick checkout.</p>

            <div className="auth-tab-switch">
              <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => onMode('login')}>Sign In</button>
              <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => onMode('register')}>Register</button>
            </div>

            {error && <div className="auth-error-banner" role="alert">{error}</div>}

            <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, email, password }) }}>
              {mode === 'register' && (
                <label className="form-input-label">
                  Full Student Name
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chamath Weerathunga" />
                </label>
              )}
              <label className="form-input-label">
                Campus Email
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="it24104225@my.sliit.lk" />
              </label>
              <label className="form-input-label">
                Password
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </label>
              <button type="submit" className="canteen-primary-btn auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : mode === 'login' ? 'Sign In & Continue' : 'Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersView({ orders, isLoading, error, onRetry, onMenu }) {
  return (
    <main className="orders-portal-page">
      <div className="orders-header-banner">
        <button type="button" className="back-to-menu-btn" onClick={onMenu}>
          <Icon name="arrow" size={16} /> Back to Canteen Menu
        </button>
        <h1>My Orders & Tokens</h1>
        <p>Review current active pickups and past campus meal history.</p>
      </div>

      {isLoading ? (
        <div className="orders-loading-state">Loading your meal tokens...</div>
      ) : error ? (
        <div className="orders-error-state">
          <p>{error}</p>
          <button type="button" className="canteen-primary-btn" onClick={onRetry}>Retry</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-card">
          <span className="empty-icon">🧾</span>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any pre-orders today. Pick from our campus kitchen menu!</p>
          <button type="button" className="canteen-primary-btn" onClick={onMenu}>View Canteen Menu</button>
        </div>
      ) : (
        <div className="orders-token-grid">
          {orders.map((order) => (
            <article className="order-receipt-card" key={order.id}>
              <div className="receipt-header">
                <div className="token-id">
                  <span>TOKEN NO.</span>
                  <strong>#{String(order.id).padStart(4, '0')}</strong>
                </div>
                <span className="token-status-pill">{order.status || 'Ready for Pickup'}</span>
              </div>
              <div className="receipt-meta">
                <span>Placed: {order.createdAt ? dateTime.format(new Date(order.createdAt)) : 'Today'}</span>
                <span>Payment: {order.paymentMethod || 'Counter Cash/Card'}</span>
              </div>
              <div className="receipt-items-list">
                {order.items?.map((item, idx) => (
                  <div className="receipt-item-row" key={idx}>
                    <span>{item.quantity}x {item.menuItemName}</span>
                    <strong>{currency.format(item.unitPrice * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="receipt-footer">
                <span>Total Due</span>
                <strong>{currency.format(order.total)}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

function EmptyState({ title, copy, action, onAction }) {
  return (
    <div className="menu-empty-banner">
      <span className="empty-plate-icon">🔍</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <button className="canteen-primary-btn" type="button" onClick={onAction}>{action}</button>
    </div>
  )
}

function Confirmation({ order, onOrders, onMenu }) {
  return (
    <main className="order-success-screen">
      <div className="success-receipt-box">
        <div className="success-check-badge">
          <Icon name="check" size={36} />
        </div>
        <span className="success-eyebrow">ORDER CONFIRMED & LOGGED</span>
        <h1>Token #{String(order.id).padStart(4, '0')}</h1>
        <p>Your meal is registered at the SLIIT canteen kitchen. Present this token number at the pickup counter.</p>

        <div className="token-summary-card">
          <div className="token-summary-row">
            <span>Payment Method</span>
            <strong>Cash or Card at Counter</strong>
          </div>
          <div className="token-summary-row">
            <span>Amount Payable</span>
            <strong className="summary-total">{currency.format(order.total)}</strong>
          </div>
        </div>

        <div className="success-button-group">
          <button className="canteen-primary-btn" type="button" onClick={onOrders}>View My Orders</button>
          <button className="canteen-secondary-btn" type="button" onClick={onMenu}>Back to Menu</button>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [menu, setMenu] = useState([])
  const [menuState, setMenuState] = useState({ loading: true, error: '' })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState(readCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authState, setAuthState] = useState({ loading: false, error: '' })
  const [authIntent, setAuthIntent] = useState(null)
  const [view, setView] = useState('menu')
  const [orders, setOrders] = useState([])
  const [ordersState, setOrdersState] = useState({ loading: false, error: '' })
  const [checkoutState, setCheckoutState] = useState({ loading: false, error: '' })
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const loadMenu = useCallback(async () => {
    setMenuState({ loading: true, error: '' })
    try {
      const data = await apiRequest('/api/menu')
      const items = Array.isArray(data) ? data : []
      setMenu(items)
      const menuIds = new Set(items.map((item) => item.id))
      setCart((current) => current
        .filter((line) => menuIds.has(line.id))
        .map((line) => ({ ...line, quantity: Math.min(20, line.quantity) })))
      setMenuState({ loading: false, error: '' })
    } catch (error) {
      setMenuState({ loading: false, error: error.message })
    }
  }, [])

  useEffect(() => { loadMenu() }, [loadMenu])
  useEffect(() => { localStorage.setItem('campusEatsCart', JSON.stringify(cart)) }, [cart])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setAuthOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const cartItems = useMemo(() => cart
    .map((line) => {
      const item = menu.find((candidate) => candidate.id === line.id)
      return item ? { ...item, quantity: line.quantity } : null
    })
    .filter(Boolean), [cart, menu])

  const cartCount = useMemo(() => cartItems.reduce((sum, line) => sum + line.quantity, 0), [cartItems])

  const filteredMenu = useMemo(() => {
    const query = search.trim().toLowerCase()
    return menu.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [category, menu, search])

  const announce = (message) => {
    setAnnouncement(message)
    window.setTimeout(() => setAnnouncement(''), 4000)
  }

  const showMenu = () => {
    setView('menu')
    setCartOpen(false)
    window.setTimeout(() => document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  const showHome = () => {
    setView('menu')
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id)
      if (existing) return current.map((line) => line.id === item.id ? { ...line, quantity: Math.min(20, line.quantity + 1) } : line)
      return [...current, { id: item.id, quantity: 1 }]
    })
    announce(`${item.name} added to your tray.`)
  }

  const changeQuantity = (id, quantity) => {
    if (quantity < 1) {
      setCart((current) => current.filter((line) => line.id !== id))
      return
    }
    setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: Math.min(20, quantity) } : line))
  }

  const loadOrders = useCallback(async (activeToken = token) => {
    if (!activeToken) return
    setOrdersState({ loading: true, error: '' })
    try {
      const data = await apiRequest('/api/orders/me', { token: activeToken })
      setOrders(Array.isArray(data) ? data : [])
      setOrdersState({ loading: false, error: '' })
    } catch (error) {
      if (error.status === 401) {
        setToken(null)
        setUser(null)
        setView('menu')
        setAuthIntent('orders')
        setAuthOpen(true)
        setAuthState({ loading: false, error: 'Your session expired. Please sign in again.' })
      } else {
        setOrdersState({ loading: false, error: error.message })
      }
    }
  }, [token])

  const showOrders = () => {
    if (!user) {
      setAuthMode('login')
      setAuthIntent('orders')
      setAuthOpen(true)
      setAuthState({ loading: false, error: 'Sign in to see your orders.' })
      return
    }
    setView('orders')
    loadOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitAuth = async (fields) => {
    setAuthState({ loading: true, error: '' })
    const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = authMode === 'login'
      ? { email: fields.email.trim(), password: fields.password }
      : { name: fields.name.trim(), email: fields.email.trim(), password: fields.password }
    try {
      const data = await apiRequest(path, { method: 'POST', body: JSON.stringify(body) })
      setToken(data.token)
      setUser(data.user)
      setAuthOpen(false)
      setAuthState({ loading: false, error: '' })
      if (authIntent === 'orders') {
        setView('orders')
        loadOrders(data.token)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (authIntent === 'checkout') {
        setCartOpen(true)
      }
      setAuthIntent(null)
      announce(`Welcome, ${data.user.name}.`)
    } catch (error) {
      setAuthState({ loading: false, error: error.message })
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setOrders([])
    setView('menu')
    setAuthOpen(false)
    setAuthIntent(null)
    announce('You have signed out.')
  }

  const checkout = async () => {
    if (!user || !token) {
      setCartOpen(false)
      setAuthMode('login')
      setAuthIntent('checkout')
      setAuthOpen(true)
      setAuthState({ loading: false, error: 'Sign in before placing your order.' })
      return
    }
    if (cartItems.length === 0) return
    setCheckoutState({ loading: true, error: '' })
    try {
      const order = await apiRequest('/api/orders', {
        method: 'POST', token,
        body: JSON.stringify({ items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })) }),
      })
      setConfirmedOrder(order)
      setCart([])
      setCartOpen(false)
      setCheckoutState({ loading: false, error: '' })
      setView('confirmation')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      if (error.status === 401) {
        setToken(null)
        setUser(null)
        setCartOpen(false)
        setCheckoutState({ loading: false, error: '' })
        setAuthIntent('checkout')
        setAuthOpen(true)
        setAuthState({ loading: false, error: 'Your session expired. Please sign in again.' })
      } else {
        setCheckoutState({ loading: false, error: error.message })
      }
    }
  }

  return (
    <div className="campus-app-shell">
      <Header
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onHome={showHome}
        onMenu={showMenu}
        onOrders={showOrders}
        onAccount={() => { setAuthIntent(null); setAuthState({ loading: false, error: '' }); setAuthOpen(true) }}
        user={user}
      />

      {view === 'orders' ? (
        <OrdersView
          orders={orders}
          isLoading={ordersState.loading}
          error={ordersState.error}
          onRetry={() => loadOrders()}
          onMenu={showMenu}
        />
      ) : view === 'confirmation' && confirmedOrder ? (
        <Confirmation order={confirmedOrder} onOrders={showOrders} onMenu={showMenu} />
      ) : (
        <main className="canteen-main-content">
          {/* Modern Canteen Banner Hero */}
          <section className="canteen-hero-hub">
            <div className="hero-hub-left">
              <div className="canteen-status-tag">
                <span className="live-indicator-dot" />
                <span>SLIIT Main Canteen • Open For Ordering</span>
              </div>
              <h1 className="hero-main-heading">
                Skip the long queue.<br />
                <em>Order meals between lectures.</em>
              </h1>
              <p className="hero-sub-text">
                Browse today's cafeteria kitchen menu, pre-order your favourite hot meals, snacks, or drinks, and collect directly from the pickup counter.
              </p>
              <div className="hero-cta-row">
                <button className="canteen-primary-btn hero-order-btn" type="button" onClick={showMenu}>
                  Browse Canteen Menu <Icon name="arrow" />
                </button>
                <div className="hero-meta-summary">
                  <strong>8 Fresh Items</strong>
                  <span>Prepared Daily</span>
                </div>
              </div>
            </div>

            <div className="hero-hub-right">
              <div className="canteen-highlight-card">
                <div className="card-top-tag">⭐ Today's Campus Special</div>
                <div className="highlight-content">
                  <span className="highlight-icon">🍛</span>
                  <h3>Chicken Kottu</h3>
                  <p>Chopped roti with chicken, fresh vegetables and Lankan spices. Prepared hot on order.</p>
                  <div className="highlight-footer">
                    <span className="highlight-price">{currency.format(750)}</span>
                    <button className="highlight-order-btn" type="button" onClick={showMenu}>
                      View Options <Icon name="arrow" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Perks Strip */}
          <section className="canteen-perks-bar" aria-label="Campus perks">
            <div className="perk-cell">
              <span className="perk-emoji">⚡</span>
              <div>
                <strong>Zero Queue Wait</strong>
                <span>Order ahead from lecture halls</span>
              </div>
            </div>
            <div className="perk-cell">
              <span className="perk-emoji">🍲</span>
              <div>
                <strong>SLIIT Kitchen Fresh</strong>
                <span>Prepared hot on campus daily</span>
              </div>
            </div>
            <div className="perk-cell">
              <span className="perk-emoji">💳</span>
              <div>
                <strong>Counter Pay</strong>
                <span>Cash or card on food pickup</span>
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section className="canteen-menu-section" id="menu">
            <div className="menu-header-bar">
              <div className="menu-title-block">
                <span className="menu-section-eyebrow">Freshly Prepared Items</span>
                <h2>Explore Canteen Menu</h2>
                <p>Nutritious meals, quick snacks, and cool beverages right on campus schedule.</p>
              </div>

              <div className="menu-filters-block">
                <label className="search-field-box">
                  <Icon name="search" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search dishes (e.g. Rice, Kottu)..."
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </label>

                <div className="category-pill-group" aria-label="Filter menu by category">
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={category === item ? 'active' : ''}
                      onClick={() => setCategory(item)}
                    >
                      {item === 'All' ? '🍽️ All' : item === 'Meals' ? '🍛 Meals' : item === 'Snacks' ? '🥪 Snacks' : '🧋 Drinks'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {menuState.loading ? (
              <MenuSkeletons />
            ) : menuState.error ? (
              <EmptyState title="Canteen Menu Offline" copy={menuState.error} action="Retry Loading" onAction={loadMenu} />
            ) : filteredMenu.length === 0 ? (
              <EmptyState
                title="No dishes found"
                copy="Try adjusting your search query or clear the active category filter."
                action="Show All Dishes"
                onAction={() => { setSearch(''); setCategory('All') }}
              />
            ) : (
              <div className="menu-grid-layout">
                {filteredMenu.map((item) => (
                  <MenuCard item={item} onAdd={addToCart} key={item.id} />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <footer className="canteen-footer">
        <div className="footer-brand">
          <BrandMark />
          <span>CampusEats SLIIT</span>
        </div>
        <p>Faculty of Computing • SE3090 Cloud Hosting Project</p>
        <span className="footer-student-tag">Student ID: IT24104225</span>
      </footer>

      <CartDrawer
        items={cartItems}
        isOpen={cartOpen}
        isSubmitting={checkoutState.loading}
        onClose={() => { setCartOpen(false); setCheckoutState({ loading: false, error: '' }) }}
        onExplore={showMenu}
        onQuantity={changeQuantity}
        onRemove={(id) => setCart((current) => current.filter((line) => line.id !== id))}
        onCheckout={checkout}
      />

      {checkoutState.error && (
        <div className="error-floating-toast" role="alert">
          <span>{checkoutState.error}</span>
          <button type="button" onClick={() => setCheckoutState({ loading: false, error: '' })}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      <AuthModal
        key={`${authOpen}-${authMode}-${user?.id ?? 'guest'}`}
        mode={authMode}
        isOpen={authOpen}
        error={authState.error}
        isSubmitting={authState.loading}
        onClose={() => { setAuthOpen(false); setAuthIntent(null) }}
        onMode={(nextMode) => { setAuthMode(nextMode); setAuthState({ loading: false, error: '' }) }}
        onSubmit={submitAuth}
        user={user}
        onLogout={logout}
      />

      <div className="sr-only" aria-live="polite">{announcement}</div>
    </div>
  )
}

export default App
