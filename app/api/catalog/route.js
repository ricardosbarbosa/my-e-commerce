import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";

function normalizeVariant(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    sku: data.sku,
    color: data.color || "#161616",
    stock: data.stock || 0,
    price: data.price || 0,
    productId: data.productId,
    sortOrder: data.sortOrder || 0
  };
}

function normalizeProduct(doc, variantsByProduct) {
  const data = doc.data();
  const variants = variantsByProduct.get(doc.id) || [];
  const firstVariant = variants[0];

  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    category: data.category,
    optionName: data.optionName || "Option",
    price: firstVariant?.price || data.price || 0,
    image: data.image,
    sortOrder: data.sortOrder || 0,
    variants
  };
}

function normalizeShippingRate(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    detail: data.detail,
    price: data.price || 0,
    currency: data.currency || "usd",
    sortOrder: data.sortOrder || 0
  };
}

function bySortOrder(a, b) {
  return a.sortOrder - b.sortOrder;
}

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin is not configured." }, { status: 503 });
    }

    const [productSnapshot, variantSnapshot, shippingSnapshot] = await Promise.all([
      adminDb.collection("products").where("status", "==", "active").get(),
      adminDb.collection("variants").where("active", "==", true).get(),
      adminDb.collection("shipping_rates").where("active", "==", true).get()
    ]);

    const variantsByProduct = new Map();
    variantSnapshot.docs.map(normalizeVariant).sort(bySortOrder).forEach((variant) => {
      const variants = variantsByProduct.get(variant.productId) || [];
      variants.push(variant);
      variantsByProduct.set(variant.productId, variants);
    });

    const products = productSnapshot.docs
      .map((doc) => normalizeProduct(doc, variantsByProduct))
      .sort(bySortOrder)
      .filter((product) => product.variants.length > 0);

    return NextResponse.json({
      products,
      shippingRates: shippingSnapshot.docs.map(normalizeShippingRate).sort(bySortOrder)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Catalog request failed." }, { status: 500 });
  }
}
