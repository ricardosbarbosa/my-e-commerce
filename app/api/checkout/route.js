import Stripe from "stripe";
import { getBaseUrl, hasStripeConfig } from "../../../lib/env";

export async function POST(request) {
  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length) {
    return Response.json({ error: "Cart is empty." }, { status: 400 });
  }

  if (!hasStripeConfig()) {
    return Response.json({
      demo: true,
      url: `${getBaseUrl()}/checkout/success?demo=1`,
      message: "Stripe is not configured in this environment."
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${getBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/checkout/cancel`,
    line_items: items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.title,
          images: [item.product.image]
        },
        unit_amount: Math.round(item.product.price * 100)
      },
      quantity: item.quantity
    })),
    metadata: {
      shippingRateId: body.shippingRateId || "standard"
    }
  });

  return Response.json({ url: session.url });
}
