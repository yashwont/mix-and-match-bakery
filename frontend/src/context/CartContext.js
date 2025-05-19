import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        item =>
          item.product_name === newItem.product_name &&
          item.flavor === newItem.flavor &&
          item.dietary === newItem.dietary &&
          item.topping === newItem.topping
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { ...newItem, quantity: 1 }];
      }
    });
  };

  const clearCart = () => setCartItems([]);
  const removeFromCart = (index) =>
    setCartItems((prev) => prev.filter((_, i) => i !== index));

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, clearCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
