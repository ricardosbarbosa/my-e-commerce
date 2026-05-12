export const products = [
  {
    id: "prod_carryall",
    title: "Utility Carryall",
    category: "Bags",
    optionName: "Color",
    price: 420,
    image: "https://images.unsplash.com/photo-1657603513821-399e205022cd?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "oxblood", title: "Oxblood", color: "#6b120f", stock: 5 },
      { id: "chestnut", title: "Chestnut", color: "#6b3d21", stock: 8 },
      { id: "black", title: "Black", color: "#161616", stock: 4 }
    ]
  },
  {
    id: "prod_mug",
    title: "Stoneware Mug",
    category: "Ceramics",
    optionName: "Glaze",
    price: 38,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "speckled", title: "Speckled White", color: "#d4d0c4", stock: 12 },
      { id: "sage", title: "Sage", color: "#777d6b", stock: 7 },
      { id: "charcoal", title: "Charcoal", color: "#2c2a25", stock: 3 }
    ]
  },
  {
    id: "prod_wallet",
    title: "Slim Wallet",
    category: "Leather Goods",
    optionName: "Color",
    price: 85,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "chestnut", title: "Chestnut", color: "#6b3d21", stock: 8 },
      { id: "espresso", title: "Espresso", color: "#2a1710", stock: 6 },
      { id: "black", title: "Black", color: "#141414", stock: 9 }
    ]
  },
  {
    id: "prod_pen",
    title: "Brass Pen",
    category: "Desk",
    optionName: "Finish",
    price: 65,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "brass", title: "Brushed Brass", color: "#b3863f", stock: 15 },
      { id: "black", title: "Blackened Brass", color: "#24231f", stock: 6 }
    ]
  },
  {
    id: "prod_tray",
    title: "Catchall Tray",
    category: "Ceramics",
    optionName: "Glaze",
    price: 42,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "matte", title: "Matte Ivory", color: "#d8d3c4", stock: 9 },
      { id: "fog", title: "Fog", color: "#8c8a7f", stock: 4 },
      { id: "ink", title: "Ink", color: "#1c1b18", stock: 5 }
    ]
  },
  {
    id: "prod_keyloop",
    title: "Key Loop",
    category: "Essentials",
    optionName: "Glaze",
    price: 28,
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "oxblood", title: "Oxblood", color: "#6b120f", stock: 20 },
      { id: "chestnut", title: "Chestnut", color: "#6b3d21", stock: 18 },
      { id: "black", title: "Black", color: "#161616", stock: 16 }
    ]
  }
];

export const shippingRates = [
  { id: "standard", name: "Standard Shipping", detail: "5 to 7 business days", price: 8 },
  { id: "expedited", name: "Expedited Shipping", detail: "2 to 3 business days", price: 15 },
  { id: "pickup", name: "Local Pickup", detail: "Portland, OR", price: 0 }
];

export const orders = [
  { id: "#1025", customer: "Eleanor Grant", date: "May 16, 2026", status: "New", items: 3, total: 524 },
  { id: "#1026", customer: "James Carter", date: "May 16, 2026", status: "New", items: 1, total: 38 },
  { id: "#1027", customer: "Olivia Bennett", date: "May 16, 2026", status: "Processing", items: 2, total: 93 },
  { id: "#1028", customer: "Noah Williams", date: "May 16, 2026", status: "Shipped", items: 1, total: 420 },
  { id: "#1024", customer: "Eleanor Grant", date: "May 15, 2026", status: "Shipped", items: 2, total: 342 }
];

export const inventoryRows = [
  { product: "Utility Carryall", sku: "BAGUTLoxblood", variant: "Oxblood", stock: 5, reserved: 1, reorder: 3 },
  { product: "Utility Carryall", sku: "BAGUTLchestnut", variant: "Chestnut", stock: 8, reserved: 0, reorder: 3 },
  { product: "Stoneware Mug", sku: "CRMMUGwhite", variant: "Speckled White", stock: 12, reserved: 2, reorder: 6 },
  { product: "Key Loop", sku: "KEYLOOPoxblood", variant: "Oxblood", stock: 20, reserved: 0, reorder: 8 }
];
