# Commerce App Plan

## Summary

Build a Next.js commerce app with Firebase Authentication, Firestore, Firebase Storage, Firebase Hosting, and Stripe Checkout.

Version one includes a customer storefront, customer accounts, product variants, cart, Stripe checkout, shipping rates, order history, and a protected admin area for products, inventory, orders, and fulfillment.

## Key Changes

### App Surfaces

Storefront:

Browse products, filter by category, view product detail, choose variant, add to cart, edit cart, sign in, checkout, and view orders.

Customer account:

Firebase email auth, profile, saved addresses, order history, and order detail.

Admin:

Protected admin dashboard with role check, product CRUD, variant stock management, image upload, order list, order status update, tracking code entry, and basic customer lookup.

### Data Model

Firestore collections:

1. `users`

Customer profile, role, default shipping address, and Stripe customer id.

2. `products`

Title, slug, description, category, status, image ids, createdAt, and updatedAt.

3. `variants`

Product id, title, SKU, option values, price, currency, stock, and active.

4. `carts`

User id, items, selected shipping option, and updatedAt.

5. `orders`

User id, Stripe checkout session id, payment status, fulfillment status, shipping address, shipping method, tracking code, totals, items, and createdAt.

6. `shipping_rates`

Name, region rule, price, currency, and active.

### Integrations

Stripe Checkout:

Create checkout sessions from the server only. Use Stripe hosted checkout for payment collection. Use webhook handling to create or update orders after payment events.

Firebase:

Use Firebase Auth for customers and admins. Use custom claims or a Firestore role field for admin access. Use Firestore security rules so customers can read their own user, cart, and orders, while admins can manage catalog and orders. Use Firebase Storage for product images.

Shipping:

Use app managed shipping rates stored in Firestore. At checkout, calculate eligible shipping rates from the saved customer address and pass the selected rate into Stripe Checkout.

### Implementation Sequence

1. Create the Next.js app with Firebase client setup, Firebase admin setup for server routes, and environment validation.

2. Build authentication first with customer sign in, account page, admin guard, and role enforcement.

3. Build catalog next with product listing, detail pages, variant selection, and product image handling.

4. Build cart and checkout with cart persistence per user, stock validation before checkout, Stripe Checkout session creation, and webhook order sync.

5. Build admin tools with product editor, variant inventory editor, order queue, fulfillment status updates, and tracking code entry.

6. Add Firestore security rules, seed data, and deployment config for Firebase Hosting.

## Test Plan

### Storefront

Customer can browse active products, open detail pages, select variants, add items to cart, edit quantities, and remove items.

Inactive products and inactive variants do not appear in storefront purchase flows.

### Accounts

Customer can sign up, sign in, sign out, update profile basics, save address, and view only their own orders.

Admin routes reject unauthenticated users and non admin customers.

### Checkout

Checkout creates a Stripe session with correct cart items, totals, selected shipping rate, and customer identity.

Stripe webhook creates an order after successful payment and keeps payment status accurate.

Failed or abandoned checkout does not create a paid order.

### Admin

Admin can create and edit products, upload images, add variants, update stock, change product status, and view changes on the storefront.

Admin can view orders, change fulfillment status, add tracking code, and preserve payment data from Stripe.

### Deployment

App builds successfully, Firestore rules deploy, Firebase Hosting serves the Next.js app, and required environment variables are documented.

## Assumptions

1. The app is a single merchant store, not a marketplace.

2. Version one supports physical products with variants and shipping rates.

3. Customers must have accounts before checkout.

4. Stripe Checkout is the only payment flow in version one.

5. Admin access is controlled through Firebase Auth plus an admin role.

6. Inventory is validated before checkout, and final order truth comes from Stripe webhook events.
