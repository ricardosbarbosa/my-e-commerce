"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { products, orders, inventoryRows, shippingRates } from "../../lib/sampleData";

const currency = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD"
});

function Icon({ name }) {
  if (name === "cart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 8h12l1 11H6L7 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="1" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6 6 6" />
    </svg>
  );
}

function customerName(user) {
  if (!user) return "Sign In";
  return user.displayName || user.email || "Account";
}

function customerInitials(user) {
  const name = customerName(user);
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function Header({ cartCount, activeSection, setActiveSection, user }) {
  return (
    <header className="topbar">
      <a className="brand" href="#store" onClick={() => setActiveSection("store")}>
        ATELIER SUPPLY
      </a>
      <nav className="nav" aria-label="Primary">
        {["Store", "Orders", "Admin"].map((item) => (
          <button
            className={activeSection === item.toLowerCase() ? "navItem active" : "navItem"}
            key={item}
            onClick={() => setActiveSection(item.toLowerCase())}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="headerActions">
        <a className="userButton" href="/login">
          <Icon name="user" />
          {customerName(user)}
        </a>
        <a className="cartButton" href="#cart">
          <Icon name="cart" />
          Cart ({cartCount})
        </a>
      </div>
    </header>
  );
}

function VariantSwatches({ product, selected, onChange }) {
  return (
    <div className="swatches" aria-label={`${product.title} variants`}>
      {product.variants.map((variant) => (
        <button
          key={variant.id}
          className={selected.id === variant.id ? "swatch selected" : "swatch"}
          style={{ background: variant.color }}
          aria-label={variant.title}
          onClick={() => onChange(variant)}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, cartItems, addItem }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const existing = cartItems.find((item) => item.product.id === product.id && item.variant.id === variant.id);

  return (
    <article className="productCard">
      <img src={product.image} alt={product.title} />
      <div className="productMeta">
        <div>
          <h3>{product.title}</h3>
          <p>{product.optionName}: {variant.title}</p>
        </div>
        <strong>{currency.format(product.price)}</strong>
      </div>
      <VariantSwatches product={product} selected={variant} onChange={setVariant} />
      <div className="stockLine">
        <span>In stock</span>
        <strong>{variant.stock}</strong>
      </div>
      <button className="addButton" onClick={() => addItem(product, variant)}>
        {existing ? "ADD ONE MORE" : "ADD TO CART"}
      </button>
    </article>
  );
}

function CartPanel({ cartItems, shipping, setShipping, updateQuantity, removeItem, checkoutState, startCheckout }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = shipping.price;
  const total = subtotal + shippingCost;

  return (
    <aside className="cartPanel" id="cart">
      <div className="cartHead">
        <h2>Your Cart</h2>
        <button aria-label="Close cart">×</button>
      </div>
      <div className="cartItems">
        {cartItems.map((item) => (
          <div className="cartItem" key={`${item.product.id}${item.variant.id}`}>
            <img src={item.product.image} alt="" />
            <div>
              <h3>{item.product.title}</h3>
              <p>{item.variant.title}</p>
              <strong>{currency.format(item.product.price)}</strong>
              <div className="quantity">
                <button onClick={() => updateQuantity(item, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item, item.quantity + 1)} aria-label="Increase quantity">+</button>
                <button className="textButton" onClick={() => removeItem(item)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="totals">
        <div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
        <div><span>Shipping</span><strong>{currency.format(shippingCost)}</strong></div>
        <div><span>Est. Total</span><strong>{currency.format(total)}</strong></div>
      </div>
      <fieldset className="shipping">
        <legend>Shipping</legend>
        {shippingRates.map((rate) => (
          <label key={rate.id} className={shipping.id === rate.id ? "rate active" : "rate"}>
            <input
              type="radio"
              checked={shipping.id === rate.id}
              onChange={() => setShipping(rate)}
            />
            <span>
              <strong>{rate.name}</strong>
              <small>{rate.detail}</small>
            </span>
            <b>{rate.price === 0 ? "Free" : currency.format(rate.price)}</b>
          </label>
        ))}
      </fieldset>
      <button className="checkoutButton" onClick={startCheckout}>
        CHECKOUT
        <Icon name="lock" />
      </button>
      <p className={checkoutState.kind === "error" ? "checkoutStatus error" : "checkoutStatus"}>
        {checkoutState.message}
      </p>
    </aside>
  );
}

function AccountPanel({ user, onSignOut }) {
  return (
    <section className="accountSection" id="orders">
      <div className="accountAside">
        <h2>My Account</h2>
        <a href="#orders">View all orders</a>
        <div className="profileMark">{customerInitials(user)}</div>
        <strong>{customerName(user)}</strong>
        <span>{user?.email || "Sign in to sync orders"}</span>
        <nav>
          <button>Orders</button>
          <button>Addresses</button>
          <button>Payment Methods</button>
          <button>Account Details</button>
          {user ? <button onClick={onSignOut}>Sign Out</button> : <a href="/login">Sign In</a>}
        </nav>
      </div>
      <div className="ordersTable">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                <td>{currency.format(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="circlePanel">
        <img src="https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?auto=format&fit=crop&w=900&q=80" alt="Stone bowl" />
        <h3>Atelier Circle</h3>
        <p>Early access, member pricing, and studio notes.</p>
        <a href="#store">LEARN MORE</a>
      </div>
    </section>
  );
}

function AdminPanel() {
  return (
    <section className="adminSection" id="admin">
      <aside>
        <h2>Admin</h2>
        {["Overview", "Orders", "Inventory", "Products", "Customers", "Settings"].map((item) => (
          <button className={item === "Orders" ? "adminActive" : ""} key={item}>{item}</button>
        ))}
      </aside>
      <div className="adminMain">
        <div className="sectionHeader">
          <h2>Order Queue</h2>
          <button>Export</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 4).map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.items}</td>
                <td>{currency.format(order.total)}</td>
                <td>
                  <select defaultValue={order.status}>
                    <option>New</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Inventory Snapshot</h3>
        <table className="compactTable">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Variant</th>
              <th>In Stock</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Reorder Point</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryRows.map((row) => (
              <tr key={row.sku}>
                <td>{row.product}</td>
                <td>{row.sku}</td>
                <td>{row.variant}</td>
                <td>{row.stock}</td>
                <td>{row.reserved}</td>
                <td>{row.stock - row.reserved}</td>
                <td>{row.reorder}</td>
                <td><span className={row.stock <= row.reorder ? "status low" : "status delivered"}>{row.stock <= row.reorder ? "Low" : "In Stock"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CommerceApp() {
  const [activeSection, setActiveSection] = useState("store");
  const [category, setCategory] = useState("All");
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([
    { product: products[0], variant: products[0].variants[0], quantity: 1 },
    { product: products[1], variant: products[1].variants[0], quantity: 2 },
    { product: products[5], variant: products[5].variants[0], quantity: 1 }
  ]);
  const [shipping, setShipping] = useState(shippingRates[0]);
  const [checkoutState, setCheckoutState] = useState({ kind: "idle", message: "Stripe Checkout opens when server keys are configured. Demo mode returns a safe local confirmation." });

  const filteredProducts = useMemo(() => {
    if (category === "All") return products;
    return products.filter((product) => product.category === category);
  }, [category]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  function addItem(product, variant) {
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.variant.id === variant.id);
      if (existing) {
        return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { product, variant, quantity: 1 }];
    });
  }

  function updateQuantity(target, quantity) {
    if (quantity <= 0) {
      removeItem(target);
      return;
    }
    setCartItems((current) => current.map((item) => item === target ? { ...item, quantity } : item));
  }

  function removeItem(target) {
    setCartItems((current) => current.filter((item) => item !== target));
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  async function startCheckout() {
    setCheckoutState({ kind: "busy", message: "Preparing secure checkout..." });
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: cartItems, shippingRateId: shipping.id })
    });
    const payload = await response.json();
    if (!response.ok) {
      setCheckoutState({ kind: "error", message: payload.error || "Checkout could not start." });
      return;
    }
    setCheckoutState({ kind: "ready", message: payload.demo ? "Demo checkout created. Configure Stripe keys to redirect to hosted checkout." : "Checkout session ready." });
    if (payload.url && !payload.demo) {
      window.location.assign(payload.url);
    }
  }

  return (
    <main>
      <Header cartCount={cartCount} activeSection={activeSection} setActiveSection={setActiveSection} user={user} />
      <section className="storeSurface" id="store">
        <aside className="heroRail">
          <img src="https://images.unsplash.com/photo-1772026251816-a6d382c67b3b?auto=format&fit=crop&w=1100&q=85" alt="Brown leather bag on a wooden bench" />
          <div>
            <span>NEW IN</span>
            <h1>Utility Carryall</h1>
            <p>Vegetable tanned leather built to age beautifully.</p>
            <a href="#products">SHOP THE COLLECTION</a>
          </div>
        </aside>
        <section className="catalog" id="products">
          <div className="catalogHead">
            <h2>Shop All</h2>
            <span>{filteredProducts.length} items</span>
          </div>
          <div className="filters" aria-label="Product categories">
            {["All", "Bags", "Leather Goods", "Ceramics", "Desk", "Essentials"].map((item) => (
              <button className={category === item ? "filterActive" : ""} key={item} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="sortLine">
            <span>Sort: Featured</span>
            <span>{user ? `Signed in as ${customerName(user)}` : "Guest browsing"}</span>
          </div>
          <div className="grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} cartItems={cartItems} addItem={addItem} />
            ))}
          </div>
        </section>
        <CartPanel
          cartItems={cartItems}
          shipping={shipping}
          setShipping={setShipping}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          checkoutState={checkoutState}
          startCheckout={startCheckout}
        />
      </section>
      <AccountPanel user={user} onSignOut={handleSignOut} />
      <AdminPanel />
    </main>
  );
}
