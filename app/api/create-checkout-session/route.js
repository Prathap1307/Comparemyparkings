// app/api/create-checkout-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.json();
  const origin = request.headers.get("origin");

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: body.productName,
            },
            unit_amount: body.amount, // in pence
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        email: body.email,
        licensePlate: body.licensePlate,
        parking: body.selectedParking,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}