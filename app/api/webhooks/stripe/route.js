import Stripe from "stripe";
import { adminDb } from "../../../../lib/firebaseAdmin";
import { hasWebhookConfig } from "../../../../lib/env";

export async function POST(request) {
  if (!hasWebhookConfig()) {
    return Response.json({ received: false, error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return Response.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" && adminDb) {
    const session = event.data.object;
    await adminDb.collection("orders").doc(session.id).set({
      stripeCheckoutSessionId: session.id,
      paymentStatus: session.payment_status,
      fulfillmentStatus: "New",
      total: session.amount_total,
      currency: session.currency,
      createdAt: new Date()
    }, { merge: true });
  }

  return Response.json({ received: true });
}
