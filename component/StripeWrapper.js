
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Load your public Stripe key
const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXX");

export default function StripeWrapper({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
