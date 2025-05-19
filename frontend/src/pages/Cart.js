import React, { useContext, useState, useMemo } from "react";
import { CartContext } from "../context/CartContext";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, setCartItems, clearCart, removeFromCart } = useContext(CartContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const increaseQty = (index) => {
    const updated = [...cartItems];
    updated[index].quantity += 1;
    setCartItems(updated);
  };

  const decreaseQty = (index) => {
    const updated = [...cartItems];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      setCartItems(updated);
    }
  };

  const toggleSelect = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  //  useMemo to track correct total
  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((acc, index) => {
      const item = cartItems[index];
      if (!item || isNaN(item.price) || isNaN(item.quantity)) return acc;
      return acc + item.price * item.quantity;
    }, 0);
  }, [selectedItems, cartItems]);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select items to checkout.");
      return;
    }

    const checkoutItems = selectedItems.map((i) => cartItems[i]);

    const remainingItems = cartItems.filter((_, idx) => !selectedItems.includes(idx));
    setCartItems(remainingItems);

    navigate("/checkout", {
      state: { selectedItems: checkoutItems }
    });
  };

  return (
    <>
      <header className="cart-header">
        <h1> Your Cart</h1>
        <nav>
          <button onClick={() => navigate("/user-menu")}>Menu</button>
          <button onClick={() => navigate("/customize-form")}>Customize</button>
        </nav>
      </header>

      <div className="cart-container">
        <ul className="cart-list">
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item, index) => (
              <li className="cart-item" key={index}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(index)}
                  onChange={() => toggleSelect(index)}
                  style={{ marginRight: "10px" }}
                />

                <div>
                  <strong>{item.product_name}</strong>
                  <p>Category: {item.category}</p>
                  <p>Price: ${parseFloat(item.price).toFixed(2)}</p>

                  {item.isCustomized && (
                    <>
                      {item.dietary && <p><strong>Dietary Preference:</strong> {item.dietary}</p>}
                      {item.flavor && <p><strong>Flavor:</strong> {item.flavor}</p>}
                      {item.topping && <p><strong>Topping:</strong> {item.topping}</p>}
                    </>
                  )}

                  <div className="qty-controls">
                    <button onClick={() => decreaseQty(index)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(index)}>+</button>
                  </div>

                  <p>Total: ${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>

                <button className="remove-btn" onClick={() => removeFromCart(index)}>
                  ❌
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="cart-summary">
          <h3>Selected Total: ${selectedTotal.toFixed(2)}</h3>
          {cartItems.length > 0 && (
            <>
              <button onClick={clearCart}>Clear Cart</button>
              <button onClick={handleCheckout} disabled={selectedItems.length === 0}>
                Checkout
              </button>
            </>
          )}
        </div>
      </div>

      <footer>
        <p>© 2024 Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Cart;
