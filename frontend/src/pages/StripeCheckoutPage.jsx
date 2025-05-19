import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("your-publishable-key");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (!error) {
      const { id } = paymentMethod;
      const res = await fetch("http://127.0.0.1:8000/api/create-payment-intent/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }), // 50.00 dollars example
      });
      const data = await res.json();

      const confirm = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: id,
      });

      if (confirm.error) {
        alert(confirm.error.message);
      } else {
        if (confirm.paymentIntent.status === "succeeded") {
          setPaymentCompleted(true);
          // Place your order here (after payment)
          alert("Payment Successful! 🎉 Order placed.");
          // You can also redirect user
        }
      }
    } else {
      console.log(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay Now</button>
      {paymentCompleted && <p>Payment successful!</p>}
    </form>
  );
};

const StripeCheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default StripeCheckoutPage;
