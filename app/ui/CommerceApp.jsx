"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { loadStorefrontCatalog } from "../../lib/catalog";
import { products as fallbackProducts, orders, inventoryRows, shippingRates as fallbackShippingRates } from "../../lib/sampleData";

const serif = "font-['Libre_Baskerville']";
const labelText = "text-[0.72rem] font-extrabold uppercase tracking-[0.08em]";
const panel = "border border-[#1a171424] bg-[#fbf8f2c7]";
const commandButton = "inline-flex min-h-11 items-center justify-center border border-[#1a17142e] px-4 text-[0.78rem] font-black uppercase tracking-[0.08em]";
const tableCell = "border-b border-[#1a17141a] px-3 py-3 text-left text-[0.86rem]";
const tableHead = `${tableCell} text-[0.72rem] font-black uppercase tracking-[0.08em] text-[#1a17148c]`;

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

function sectionHref(section) {
  return `#${section}`;
}

function Header({ cartCount, activeSection, setActiveSection, user }) {
  return (
    <header className="sticky top-0 z-50 grid grid-cols-1 items-center gap-4 border-b border-[#1a171424] bg-[#f7f2eadb] px-[clamp(1rem,3vw,2rem)] py-[0.85rem] backdrop-blur-[18px] min-[921px]:grid-cols-[minmax(12rem,1fr)_auto_minmax(18rem,1fr)]">
      <a className={`${serif} text-[clamp(1rem,1.6vw,1.45rem)] tracking-[0.04em]`} href="#store" onClick={() => setActiveSection("store")}>
        ATELIER SUPPLY
      </a>
      <nav className="flex w-full items-center gap-1 border border-[#1a171424] bg-[#fbf8f2] p-1 min-[921px]:w-auto" aria-label="Primary">
        {["Store", "Orders", "Admin"].map((item) => (
          <a
            className={cx(
              "inline-flex flex-1 items-center justify-center px-4 py-[0.58rem] text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-[#1a1714ad] min-[921px]:flex-none",
              activeSection === item.toLowerCase() && "bg-[#1a1714] text-[#f7f2ea]"
            )}
            href={sectionHref(item.toLowerCase())}
            key={item}
            onClick={() => setActiveSection(item.toLowerCase())}
          >
            {item}
          </a>
        ))}
      </nav>
      <div className="flex justify-end gap-2">
        <a className="hidden min-h-[2.55rem] items-center justify-center gap-2 border border-[#1a171429] bg-[#fbf8f2] px-4 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#1a1714] min-[621px]:inline-flex min-[921px]:flex-none" href="/login">
          <Icon name="user" />
          {customerName(user)}
        </a>
        <a className="inline-flex min-h-[2.55rem] flex-1 items-center justify-center gap-2 border border-[#741210] bg-[#741210] px-4 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#fff9ef] min-[921px]:flex-none" href="#cart">
          <Icon name="cart" />
          Cart ({cartCount})
        </a>
      </div>
    </header>
  );
}

function VariantSwatches({ product, selected, onChange }) {
  return (
    <div className="flex gap-2 m-4" aria-label={`${product.title} variants`}>
      {product.variants.map((variant) => (
        <button
          key={variant.id}
          className={cx(
            "h-[1.4rem] w-[1.4rem] border border-[#1a171447]",
            selected.id === variant.id && "outline outline-2 outline-offset-[3px] outline-[#741210]"
          )}
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
  const existing = cartItems.find((item) => item.product.id === product.id && item.variant.id === variant?.id);

  useEffect(() => {
    setVariant(product.variants[0]);
  }, [product]);

  return (
    <article className="productCard flex min-h-[28rem] flex-col border border-[#1a171424] bg-[#fbf8f2b8] transition duration-200 hover:-translate-y-1 hover:shadow-[0_1.4rem_2.8rem_rgba(26,23,20,0.12)] max-[620px]:min-h-0">
      <img className="aspect-[4/5] w-full object-cover saturate-[0.82] sepia-[0.08] contrast-[1.04]" src={product.image} alt={product.title} />
      <div className="flex justify-between gap-4 px-4 pt-4">
        <div>
          <h3 className="m-0 text-[0.95rem] font-extrabold">{product.title}</h3>
          <p className={`mt-1 text-[#1a171494] ${labelText}`}>{product.optionName}: {variant?.title}</p>
        </div>
        <strong>{currency.format(product.price)}</strong>
      </div>
      <VariantSwatches product={product} selected={variant} onChange={setVariant} />
      <div className={`mt-auto mb-4 flex justify-between px-4 text-[#1a171499] ${labelText}`}>
        <span>In stock</span>
        <strong className="text-[#31525f]">{variant?.stock || 0}</strong>
      </div>
      <button className="mx-4 mb-4 min-h-12 border-0 bg-[#1a1714] text-[0.78rem] font-black uppercase tracking-[0.08em] text-[#fff9ef]" disabled={!variant} onClick={() => addItem(product, variant)}>
        {existing ? "ADD ONE MORE" : "ADD TO CART"}
      </button>
    </article>
  );
}

function CartPanel({ cartItems, shipping, setShipping, shippingRates, updateQuantity, removeItem, checkoutState, startCheckout }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = shipping.price;
  const total = subtotal + shippingCost;

  return (
    <aside className="cartPanel sticky top-[5.6rem] max-h-[calc(100vh-7.2rem)] overflow-auto border border-[#1a171429] bg-[#fbf8f2] p-4 shadow-[0_1.4rem_3rem_rgba(26,23,20,0.1)] max-[1280px]:relative max-[1280px]:top-0 max-[1280px]:col-span-full" id="cart">
      <div className="flex items-center justify-between gap-4">
        <h2 className={`${serif} m-0 text-[clamp(2.1rem,3vw,3.8rem)] leading-none`}>Your Cart</h2>
        <button className="h-8 w-8 border border-[#1a17142e] bg-transparent text-xl" aria-label="Close cart">×</button>
      </div>
      <div className="grid max-h-[24vh] gap-3 overflow-auto pt-2">
        {cartItems.map((item) => (
          <div className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-[#1a17141a] pb-3 max-[620px]:grid-cols-[4rem_1fr]" key={`${item.product.id}${item.variant.id}`}>
            <img className="h-[5.7rem] w-[4.5rem] object-cover" src={item.product.image} alt="" />
            <div>
              <h3 className="m-0 text-[0.95rem] font-extrabold">{item.product.title}</h3>
              <p className="my-1 text-[0.78rem] text-[#1a171494]">{item.variant.title}</p>
              <strong>{currency.format(item.product.price)}</strong>
              <div className="mt-2 flex items-center gap-1">
                <button className="min-h-7 min-w-7 border border-[#1a17142e] bg-transparent" onClick={() => updateQuantity(item, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                <span>{item.quantity}</span>
                <button className="min-h-7 min-w-7 border border-[#1a17142e] bg-transparent" onClick={() => updateQuantity(item, item.quantity + 1)} aria-label="Increase quantity">+</button>
                <button className="ml-auto border-0 text-[0.72rem] font-black uppercase tracking-[0.07em] text-[#741210]" onClick={() => removeItem(item)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="my-4 grid gap-2 border-y border-[#1a17141f] py-4">
        <div className="flex justify-between"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
        <div className="flex justify-between"><span>Shipping</span><strong>{currency.format(shippingCost)}</strong></div>
        <div className="flex justify-between"><span>Est. Total</span><strong>{currency.format(total)}</strong></div>
      </div>
      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className={`pb-3 ${labelText}`}>Shipping</legend>
        {shippingRates.map((rate) => (
          <label key={rate.id} className={cx("grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-[#1a171424] p-3", shipping.id === rate.id && "border-[#741210] bg-[#fff9ef]")}>
            <input
              className="accent-[#741210]"
              type="radio"
              checked={shipping.id === rate.id}
              onChange={() => setShipping(rate)}
            />
            <span className="grid">
              <strong>{rate.name}</strong>
              <small className={`text-[#1a1714a3] ${labelText}`}>{rate.detail}</small>
            </span>
            <b>{rate.price === 0 ? "Free" : currency.format(rate.price)}</b>
          </label>
        ))}
      </fieldset>
      <button className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 border-0 bg-[#741210] text-[0.78rem] font-black uppercase tracking-[0.08em] text-[#fff9ef]" onClick={startCheckout}>
        CHECKOUT
        <Icon name="lock" />
      </button>
      <p className={cx("mt-3 text-[0.72rem] font-extrabold leading-relaxed text-[#1a1714a3]", checkoutState.kind === "error" && "text-[#741210]")}>
        {checkoutState.message}
      </p>
    </aside>
  );
}

function AccountPanel({ user, onSignOut }) {
  return (
    <section className="grid max-w-[1860px] grid-cols-[minmax(16rem,0.55fr)_minmax(28rem,1fr)_minmax(18rem,0.65fr)] gap-[clamp(1rem,2vw,1.5rem)] mx-auto p-[clamp(1rem,2vw,1.5rem)] max-[920px]:grid-cols-1 max-[620px]:p-3" id="orders">
      <div className={`${panel} p-[clamp(1rem,2vw,1.35rem)]`}>
        <h2 className={`${serif} m-0 text-[clamp(2.1rem,3vw,3.8rem)] leading-none`}>My Account</h2>
        <a className="font-black uppercase text-[#741210]" href="#orders">View all orders</a>
        <div className={`${serif} my-5 grid h-20 w-20 place-items-center bg-[#31525f] text-2xl text-[#fff9ef]`}>{customerInitials(user)}</div>
        <strong>{customerName(user)}</strong>
        <span className={`block text-[#1a1714a3] ${labelText}`}>{user?.email || "Sign in to sync orders"}</span>
        <nav className="mt-5 grid gap-2">
          <button className={commandButton}>Orders</button>
          <button className={commandButton}>Addresses</button>
          <button className={commandButton}>Payment Methods</button>
          <button className={commandButton}>Account Details</button>
          {user ? <button className={commandButton} onClick={onSignOut}>Sign Out</button> : <a className={commandButton} href="/login">Sign In</a>}
        </nav>
      </div>
      <div className={`${panel} min-w-0 max-w-full overflow-auto p-[clamp(1rem,2vw,1.35rem)]`}>
        <h3 className="m-0 text-[0.95rem] font-extrabold">Recent Orders</h3>
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>Order</th>
              <th className={tableHead}>Date</th>
              <th className={tableHead}>Status</th>
              <th className={tableHead}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={tableCell}>{order.id}</td>
                <td className={tableCell}>{order.date}</td>
                <td className={tableCell}><StatusBadge value={order.status} /></td>
                <td className={tableCell}>{currency.format(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="min-h-96 border border-[#1a171424] bg-[#741210] p-[clamp(1rem,2vw,1.35rem)] text-[#fff9ef]">
        <img className="mb-4 h-60 w-full object-cover" src="https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?auto=format&fit=crop&w=900&q=80" alt="Stone bowl" />
        <h3 className="m-0 text-[0.95rem] font-extrabold">Atelier Circle</h3>
        <p className="leading-relaxed text-[#fff9efb3]">Early access, member pricing, and studio notes.</p>
        <a className="inline-flex min-h-11 items-center border border-[#fff9ef61] px-4 text-[0.76rem] font-black uppercase tracking-[0.08em]" href="#store">LEARN MORE</a>
      </div>
    </section>
  );
}

function StatusBadge({ value }) {
  const tone = {
    New: "text-[#741210]",
    Low: "text-[#741210]",
    Processing: "text-[#31525f]",
    Shipped: "text-[#345b2c]",
    Delivered: "text-[#345b2c]",
    "In Stock": "text-[#345b2c]"
  }[value] || "text-[#1a1714]";

  return (
    <span className={`inline-flex min-h-7 items-center border border-[#1a171429] bg-[#fff9ef] px-2 text-[0.68rem] font-black uppercase tracking-[0.08em] ${tone}`}>
      {value}
    </span>
  );
}

function AdminPanel() {
  return (
    <section className="grid max-w-[1860px] grid-cols-[minmax(14rem,0.24fr)_minmax(0,1fr)] gap-[clamp(1rem,2vw,1.5rem)] mx-auto p-[clamp(1rem,2vw,1.5rem)] pb-16 max-[920px]:grid-cols-1 max-[620px]:p-3" id="admin">
      <aside className="grid content-start gap-2 border border-[#1a171424] bg-[#14191e] p-[clamp(1rem,2vw,1.35rem)] text-[#fff9ef]">
        <h2 className={`${serif} m-0 text-[clamp(2.1rem,3vw,3.8rem)] leading-none`}>Admin</h2>
        {["Overview", "Orders", "Inventory", "Products", "Customers", "Settings"].map((item) => (
          <button className={cx(commandButton, "justify-start border-[#fff9ef24] text-[#fff9ef]", item === "Orders" && "bg-[#31525f]")} key={item}>{item}</button>
        ))}
      </aside>
      <div className={`${panel} min-w-0 max-w-full overflow-auto p-[clamp(1rem,2vw,1.35rem)]`}>
        <div className="flex items-center justify-between gap-4">
          <h2 className={`${serif} m-0 text-[clamp(2.1rem,3vw,3.8rem)] leading-none`}>Order Queue</h2>
          <button className={`${commandButton} min-w-28 border-0 bg-[#31525f] text-[#fff9ef]`}>Export</button>
        </div>
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>Order</th>
              <th className={tableHead}>Customer</th>
              <th className={tableHead}>Date</th>
              <th className={tableHead}>Items</th>
              <th className={tableHead}>Total</th>
              <th className={tableHead}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 4).map((order) => (
              <tr key={order.id}>
                <td className={tableCell}>{order.id}</td>
                <td className={tableCell}>{order.customer}</td>
                <td className={tableCell}>{order.date}</td>
                <td className={tableCell}>{order.items}</td>
                <td className={tableCell}>{currency.format(order.total)}</td>
                <td className={tableCell}>
                  <select className="min-h-12 border-0 bg-[#1a1714] px-3 text-[0.78rem] font-black uppercase tracking-[0.08em] text-[#fff9ef]" defaultValue={order.status}>
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
        <h3 className="mt-8 text-[0.95rem] font-extrabold">Inventory Snapshot</h3>
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              <th className={`${tableHead} whitespace-nowrap`}>Product</th>
              <th className={`${tableHead} whitespace-nowrap`}>SKU</th>
              <th className={`${tableHead} whitespace-nowrap`}>Variant</th>
              <th className={`${tableHead} whitespace-nowrap`}>In Stock</th>
              <th className={`${tableHead} whitespace-nowrap`}>Reserved</th>
              <th className={`${tableHead} whitespace-nowrap`}>Available</th>
              <th className={`${tableHead} whitespace-nowrap`}>Reorder Point</th>
              <th className={`${tableHead} whitespace-nowrap`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryRows.map((row) => (
              <tr key={row.sku}>
                <td className={`${tableCell} whitespace-nowrap`}>{row.product}</td>
                <td className={`${tableCell} whitespace-nowrap`}>{row.sku}</td>
                <td className={`${tableCell} whitespace-nowrap`}>{row.variant}</td>
                <td className={`${tableCell} whitespace-nowrap`}>{row.stock}</td>
                <td className={`${tableCell} whitespace-nowrap`}>{row.reserved}</td>
                <td className={`${tableCell} whitespace-nowrap`}>{row.stock - row.reserved}</td>
                <td className={`${tableCell} whitespace-nowrap`}>{row.reorder}</td>
                <td className={`${tableCell} whitespace-nowrap`}><StatusBadge value={row.stock <= row.reorder ? "Low" : "In Stock"} /></td>
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
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts);
  const [catalogSource, setCatalogSource] = useState("Loading Firestore catalog...");
  const [availableShippingRates, setAvailableShippingRates] = useState(fallbackShippingRates);
  const [cartItems, setCartItems] = useState([
    { product: fallbackProducts[0], variant: fallbackProducts[0].variants[0], quantity: 1 },
    { product: fallbackProducts[1], variant: fallbackProducts[1].variants[0], quantity: 2 },
    { product: fallbackProducts[5], variant: fallbackProducts[5].variants[0], quantity: 1 }
  ]);
  const [shipping, setShipping] = useState(fallbackShippingRates[0]);
  const [checkoutState, setCheckoutState] = useState({ kind: "idle", message: "Stripe Checkout opens when server keys are configured. Demo mode returns a safe local confirmation." });

  const filteredProducts = useMemo(() => {
    if (category === "All") return catalogProducts;
    return catalogProducts.filter((product) => product.category === category);
  }, [catalogProducts, category]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadStorefrontCatalog()
      .then((catalog) => {
        if (!mounted) return;
        if (!catalog.products.length) {
          setCatalogSource("Firestore is connected, but no active products were found. Showing local sample data.");
          return;
        }

        setCatalogProducts(catalog.products);
        setAvailableShippingRates(catalog.shippingRates.length ? catalog.shippingRates : fallbackShippingRates);
        setShipping(catalog.shippingRates[0] || fallbackShippingRates[0]);
        setCatalogSource("Catalog loaded from Firestore.");
      })
      .catch((error) => {
        if (!mounted) return;
        setCatalogSource(`Firestore catalog unavailable: ${error.code || error.message}. Showing local sample data.`);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function syncSectionFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (["store", "orders", "admin"].includes(hash)) {
        setActiveSection(hash);
      }
    }

    syncSectionFromHash();
    window.addEventListener("hashchange", syncSectionFromHash);
    return () => window.removeEventListener("hashchange", syncSectionFromHash);
  }, []);

  function addItem(product, variant) {
    if (!variant) return;

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
      <section className="grid max-w-[1860px] grid-cols-[minmax(16rem,0.78fr)_minmax(28rem,1.35fr)_minmax(20rem,0.7fr)] items-start gap-[clamp(1rem,2vw,1.5rem)] mx-auto p-[clamp(1rem,2vw,1.5rem)] max-[1280px]:grid-cols-[minmax(14rem,0.65fr)_minmax(26rem,1fr)] max-[920px]:grid-cols-1 max-[620px]:p-3" id="store">
        <aside className="sticky top-[5.6rem] flex h-[calc(100vh-7.2rem)] min-h-[42rem] flex-col overflow-hidden border border-[#1a171424] bg-[#16191d] text-[#fff9ef] max-[920px]:relative max-[920px]:top-0 max-[920px]:h-auto max-[920px]:min-h-0">
          <img className="h-[clamp(20rem,48vh,30rem)] w-full object-cover saturate-[0.84] contrast-[1.05] max-[920px]:h-[42vh]" src="https://images.unsplash.com/photo-1772026251816-a6d382c67b3b?auto=format&fit=crop&w=1100&q=85" alt="Brown leather bag on a wooden bench" />
          <div className="flex-1 p-[clamp(1.2rem,2vw,1.75rem)]">
            <span className={`${labelText} text-[#c7b58e]`}>NEW IN</span>
            <h1 className={`${serif} my-2 max-w-[7ch] text-[clamp(2.8rem,5.2vw,5.9rem)] leading-[0.94]`}>Utility Carryall</h1>
            <p className="mb-5 max-w-md leading-relaxed text-[#fff9efb8]">Vegetable tanned leather built to age beautifully.</p>
            <a className="inline-flex min-h-11 items-center border border-[#fff9ef5c] px-4 text-[0.76rem] font-black uppercase tracking-[0.08em]" href="#products">SHOP THE COLLECTION</a>
          </div>
        </aside>
        <section className="min-w-0" id="products">
          <div className="flex items-center justify-between gap-4">
            <h2 className={`${serif} m-0 text-[clamp(2.1rem,3vw,3.8rem)] leading-none`}>Shop All</h2>
            <span className="font-black text-[#741210]">{filteredProducts.length} items</span>
          </div>
          <div className="my-4 flex flex-wrap gap-2" aria-label="Product categories">
            {["All", "Bags", "Leather Goods", "Ceramics", "Desk", "Essentials"].map((item) => (
              <button className={cx("min-h-9 border border-[#1a171429] bg-[#fbf8f2b8] px-3 text-[0.74rem] font-black uppercase tracking-[0.08em] text-[#2d2721]", category === item && "border-[#741210] bg-[#741210] text-[#fff9ef]")} key={item} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className={`mb-4 flex justify-between gap-4 border-y border-[#1a17141f] py-3 text-[#1a1714a3] ${labelText}`}>
            <span>Sort: Featured</span>
            <span>{user ? `Signed in as ${customerName(user)}` : "Guest browsing"}</span>
          </div>
          <p className={`catalogStatus mb-4 mt-[-0.35rem] text-[#1a171494] ${labelText}`}>{catalogSource}</p>
          <div className="grid grid-cols-2 gap-4 max-[620px]:grid-cols-1">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} cartItems={cartItems} addItem={addItem} />
            ))}
          </div>
        </section>
        <CartPanel
          cartItems={cartItems}
          shipping={shipping}
          setShipping={setShipping}
          shippingRates={availableShippingRates}
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
