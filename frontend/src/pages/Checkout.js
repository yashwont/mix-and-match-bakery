import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "../services/axiosInstance";
import "./Checkout.css";

const stripePromise = loadStripe("pk_test_51RIMqePDBe8rrRSod7Lp6X8sNVaMZ1SPqj1UkNcMt5UDNSmGMnRbWs0wnOkf6lRmzrZ1GNT0CXPr5a5f4rzVU8vi00oW20EH0A");

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const selectedItems = useMemo(() => {
    return Array.isArray(state?.selectedItems) ? state.selectedItems : [];
  }, [state]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [phoneError, setPhoneError] = useState("");

  const getTotal = () => {
    const subtotal = selectedItems.reduce((acc, item) => {
      const price = parseFloat(item?.price || 0);
      const quantity = parseInt(item?.quantity || 1);
      return acc + (isNaN(price) || isNaN(quantity) ? 0 : price * quantity);
    }, 0);
    return usePoints && userPoints >= 100 ? subtotal * 0.9 : subtotal;
  };

  const fetchUserPoints = async () => {
    try {
      const res = await axios.get("/api/profile/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      if (res.data.points) setUserPoints(res.data.points);
    } catch (err) {
      console.error("Failed to fetch user points", err);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    const regex = /^\+?\d{7,15}$/;
    setPhoneError(regex.test(value) ? "" : "Phone must be 7–15 digits (optional +)");
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (phoneError) {
      alert("Please correct the phone number before submitting.");
      return;
    }

    if (!stripe || !elements) {
      alert("Stripe is not loaded yet.");
      return;
    }

    try {
      const amount = Math.round(getTotal() * 100); // Stripe expects cents
      const res = await axios.post("/api/create-payment-intent/", { amount }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      const clientSecret = res.data.clientSecret;

      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        console.error("Payment error:", error);
        alert(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        const payload = {
          use_points: usePoints,
          orders: selectedItems.map((item) => ({
            product_name: item?.product_name || "Unknown",
            category: item?.category || "N/A",
            price: parseFloat(item?.price || 0),
            quantity: parseInt(item?.quantity || 1),
            is_customized: item?.isCustomized || false,
            dietary: item?.dietary || "",
            flavor: item?.flavor || "",
            topping: item?.topping || "",
            customer_name: name,
            customer_phone: phone,
            customer_address: address,
          })),
        };

        await axios.post("/api/place-order/", payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });

        alert("🎉 Payment Successful & Order Placed!");
        navigate("/user-menu");
      }
    } catch (err) {
      console.error("Error during payment/order:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleEsewaPayment = async () => {
    if (!name || !phone || !address) {
      alert("Please fill out delivery information first.");
      return;
    }
  
    const orderId = `MMB-${Date.now()}`;
    const totalAmount = Math.round(getTotal());
  
    localStorage.setItem("pendingOrder", JSON.stringify({
      use_points: usePoints,
      orders: selectedItems.map((item) => ({
        product_name: item?.product_name || "Unknown",
        category: item?.category || "N/A",
        price: parseFloat(item?.price || 0),
        quantity: parseInt(item?.quantity || 1),
        is_customized: item?.isCustomized || false,
        dietary: item?.dietary || "",
        flavor: item?.flavor || "",
        topping: item?.topping || "",
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
      })),
    }));
  
    try {
      const res = await axios.post("/api/esewa/initiate/", {
        amount: totalAmount,
        pid: orderId,
      });
  
      if (res.data?.payment_url) {
        console.log("Redirecting to eSewa:", res.data.payment_url);
        window.location.href = res.data.payment_url;
      } else {
        console.error("eSewa initiation response:", res.data);
        alert("Payment URL not found. Please try again.");
      }      
    } catch (error) {
      console.error("Esewa payment initiation failed:", error);
      alert("Error initiating eSewa payment.");
    }
  };
  

  return (
    <div className="checkout">
      <header className="checkout-header">
        <h1 onClick={() => navigate("/menu")}>Mix & Match Bakery</h1>
        <nav>
          <button onClick={() => navigate("/user-menu")}>Menu</button>
          <button onClick={() => navigate("/customize-form")}>Customize</button>
          <button onClick={() => navigate("/cart")}>Cart</button>
        </nav>
      </header>

      <main className="checkout-main">
        <div className="checkout-left">
          <h2>🧾 Order Summary</h2>
          <ul className="checkout-items">
            {selectedItems.map((item, index) => (
              <li key={index} className="checkout-item">
                <strong>{item.product_name}</strong> — ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                {item.isCustomized && (
                  <ul className="customization-info">
                    {item.dietary && <li>Dietary: {item.dietary}</li>}
                    {item.flavor && <li>Flavor: {item.flavor}</li>}
                    {item.topping && <li>Topping: {item.topping}</li>}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <h3>Total: ${getTotal().toFixed(2)}</h3>
          {userPoints >= 100 && (
            <label style={{ display: "block", marginTop: "1rem" }}>
              <input
                type="checkbox"
                checked={usePoints}
                onChange={() => setUsePoints(!usePoints)}
              />
              Use 100 points for 10% discount
            </label>
          )}
        </div>

        <div className="checkout-right">
          <form className="checkout-form" onSubmit={handleOrderSubmit}>
            <h2> Delivery Information</h2>

            <label>Name:</label>
            <input
              type="text"
              required
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Phone:</label>
            <input
              type="tel"
              required
              placeholder="e.g., +1234567890"
              value={phone}
              onChange={handlePhoneChange}
            />
            {phoneError && <p className="error-text">{phoneError}</p>}

            <label>Address:</label>
            <textarea
              required
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <h2>💳 Payment Information</h2>
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />

            <button
              type="submit"
              disabled={!name || !phone || !address || !!phoneError || !stripe}
            >
              Pay & Place Order
            </button>
          </form>
          {/* { <button
          style={{ marginTop: "1rem", backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", borderRadius: "5px", border: "none", fontSize: "16px", cursor: "pointer" }}
          onClick={handleEsewaPayment}>
          Pay with eSewa
          </button> } */}
        </div>
      </main>

      <footer className="checkout-footer">
        <p>© 2024 Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </div>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);

export default CheckoutPage;
