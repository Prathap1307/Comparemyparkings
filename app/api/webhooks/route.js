// app/api/webhooks/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const text = await req.text();
  const signature = req.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Received event:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        await handleFailedPayment(failedIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}

async function handleSuccessfulPayment(paymentIntent) {
  try {
    // Update your database
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) throw new Error('No booking ID in metadata');

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/update-booking`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: 'confirmed',
        paymentIntentId: paymentIntent.id
      })
    });

    if (!response.ok) throw new Error('Failed to update booking');
    
    console.log('Booking updated successfully');
  } catch (error) {
    console.error('Failed to handle successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) throw new Error('No booking ID in metadata');

    await fetch(`${process.env.NEXTAUTH_URL}/api/update-booking`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        status: 'payment_failed'
      })
    });
  } catch (error) {
    console.error('Failed to handle failed payment:', error);
  }
}