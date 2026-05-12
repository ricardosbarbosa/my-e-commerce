import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { cert, getApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";

function readEnv() {
  return readFileSync(".env", "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .reduce((env, line) => {
      const index = line.indexOf("=");
      if (index === -1) return env;
      env[line.slice(0, index)] = normalizeEnvValue(line.slice(index + 1));
      return env;
    }, {});
}

function normalizeEnvValue(value) {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.at(-1) === quote) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

const env = readEnv();

function hasAdminCredentials() {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}

function clientDb() {
  const app = initializeApp({
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  });

  return getFirestore(app);
}

function adminDb() {
  const app = getApps()[0] || initializeAdminApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });

  return getAdminFirestore(app);
}

const products = [
  {
    id: "prod_carryall",
    title: "Utility Carryall",
    slug: "utility-carryall",
    description: "Vegetable tanned leather built to age beautifully.",
    category: "Bags",
    optionName: "Color",
    status: "active",
    image: "https://images.unsplash.com/photo-1657603513821-399e205022cd?auto=format&fit=crop&w=900&q=85",
    sortOrder: 10,
    variants: [
      { id: "prod_carryall_oxblood", title: "Oxblood", sku: "BAGUTLOXBLOOD", color: "#6b120f", price: 420, stock: 5, sortOrder: 10 },
      { id: "prod_carryall_chestnut", title: "Chestnut", sku: "BAGUTLCHESTNUT", color: "#6b3d21", price: 420, stock: 8, sortOrder: 20 },
      { id: "prod_carryall_black", title: "Black", sku: "BAGUTLBLACK", color: "#161616", price: 420, stock: 4, sortOrder: 30 }
    ]
  },
  {
    id: "prod_mug",
    title: "Stoneware Mug",
    slug: "stoneware-mug",
    description: "Thrown stoneware with a soft daily glaze.",
    category: "Ceramics",
    optionName: "Glaze",
    status: "active",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
    sortOrder: 20,
    variants: [
      { id: "prod_mug_speckled", title: "Speckled White", sku: "CRMMUGSPECKLED", color: "#d4d0c4", price: 38, stock: 12, sortOrder: 10 },
      { id: "prod_mug_sage", title: "Sage", sku: "CRMMUGSAGE", color: "#777d6b", price: 38, stock: 7, sortOrder: 20 },
      { id: "prod_mug_charcoal", title: "Charcoal", sku: "CRMMUGCHARCOAL", color: "#2c2a25", price: 38, stock: 3, sortOrder: 30 }
    ]
  },
  {
    id: "prod_wallet",
    title: "Slim Wallet",
    slug: "slim-wallet",
    description: "Low profile leather card storage.",
    category: "Leather Goods",
    optionName: "Color",
    status: "active",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    sortOrder: 30,
    variants: [
      { id: "prod_wallet_chestnut", title: "Chestnut", sku: "WALSLMCHESTNUT", color: "#6b3d21", price: 85, stock: 8, sortOrder: 10 },
      { id: "prod_wallet_espresso", title: "Espresso", sku: "WALSLMESPRESSO", color: "#2a1710", price: 85, stock: 6, sortOrder: 20 },
      { id: "prod_wallet_black", title: "Black", sku: "WALSLMBLACK", color: "#141414", price: 85, stock: 9, sortOrder: 30 }
    ]
  },
  {
    id: "prod_pen",
    title: "Brass Pen",
    slug: "brass-pen",
    description: "Weighted brass writing instrument.",
    category: "Desk",
    optionName: "Finish",
    status: "active",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=85",
    sortOrder: 40,
    variants: [
      { id: "prod_pen_brass", title: "Brushed Brass", sku: "PENBRSBRASS", color: "#b3863f", price: 65, stock: 15, sortOrder: 10 },
      { id: "prod_pen_black", title: "Blackened Brass", sku: "PENBRSBLACK", color: "#24231f", price: 65, stock: 6, sortOrder: 20 }
    ]
  },
  {
    id: "prod_tray",
    title: "Catchall Tray",
    slug: "catchall-tray",
    description: "Ceramic tray for keys, coins, and daily carry.",
    category: "Ceramics",
    optionName: "Glaze",
    status: "active",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
    sortOrder: 50,
    variants: [
      { id: "prod_tray_matte", title: "Matte Ivory", sku: "CRMTRYMATTE", color: "#d8d3c4", price: 42, stock: 9, sortOrder: 10 },
      { id: "prod_tray_fog", title: "Fog", sku: "CRMTRYFOG", color: "#8c8a7f", price: 42, stock: 4, sortOrder: 20 },
      { id: "prod_tray_ink", title: "Ink", sku: "CRMTRYINK", color: "#1c1b18", price: 42, stock: 5, sortOrder: 30 }
    ]
  },
  {
    id: "prod_keyloop",
    title: "Key Loop",
    slug: "key-loop",
    description: "Hardware and leather loop for daily carry.",
    category: "Essentials",
    optionName: "Color",
    status: "active",
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=900&q=85",
    sortOrder: 60,
    variants: [
      { id: "prod_keyloop_oxblood", title: "Oxblood", sku: "KEYLOOPOXBLOOD", color: "#6b120f", price: 28, stock: 20, sortOrder: 10 },
      { id: "prod_keyloop_chestnut", title: "Chestnut", sku: "KEYLOOPCHESTNUT", color: "#6b3d21", price: 28, stock: 18, sortOrder: 20 },
      { id: "prod_keyloop_black", title: "Black", sku: "KEYLOOPBLACK", color: "#161616", price: 28, stock: 16, sortOrder: 30 }
    ]
  }
];

const shippingRates = [
  { id: "standard", name: "Standard Shipping", detail: "5 to 7 business days", regionRule: "US", price: 8, currency: "usd", active: true, sortOrder: 10 },
  { id: "expedited", name: "Expedited Shipping", detail: "2 to 3 business days", regionRule: "US", price: 15, currency: "usd", active: true, sortOrder: 20 },
  { id: "pickup", name: "Local Pickup", detail: "Portland, OR", regionRule: "LOCAL", price: 0, currency: "usd", active: true, sortOrder: 30 }
];

async function seedWithClient() {
  const db = clientDb();
  const now = serverTimestamp();

  for (const product of products) {
    const { variants, ...productData } = product;
    await setDoc(doc(db, "products", product.id), {
      ...productData,
      createdAt: now,
      updatedAt: now
    }, { merge: true });

    for (const variant of variants) {
      await setDoc(doc(db, "variants", variant.id), {
        ...variant,
        productId: product.id,
        currency: "usd",
        active: true,
        updatedAt: now
      }, { merge: true });
    }
  }

  for (const rate of shippingRates) {
    await setDoc(doc(db, "shipping_rates", rate.id), {
      ...rate,
      updatedAt: now
    }, { merge: true });
  }
}

async function seedWithAdmin() {
  const db = adminDb();
  const now = FieldValue.serverTimestamp();

  for (const product of products) {
    const { variants, ...productData } = product;
    await db.collection("products").doc(product.id).set({
      ...productData,
      createdAt: now,
      updatedAt: now
    }, { merge: true });

    for (const variant of variants) {
      await db.collection("variants").doc(variant.id).set({
        ...variant,
        productId: product.id,
        currency: "usd",
        active: true,
        updatedAt: now
      }, { merge: true });
    }
  }

  for (const rate of shippingRates) {
    await db.collection("shipping_rates").doc(rate.id).set({
      ...rate,
      updatedAt: now
    }, { merge: true });
  }
}

(hasAdminCredentials() ? seedWithAdmin() : seedWithClient())
  .then(() => {
    console.log(`Seeded ${products.length} products and ${shippingRates.length} shipping rates.`);
  })
  .catch((error) => {
    console.error(error.code || error.name, error.message);
    if (!hasAdminCredentials()) {
      console.error("Client seeding was denied. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env to seed with Firebase Admin.");
    }
    process.exit(1);
  });
