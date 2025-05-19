import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./MuffinForm.css";

const MuffinForm = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [flavor, setFlavor] = useState("");
  const [dietary, setDietary] = useState("");
  const [glaze, setGlaze] = useState("");

  const price = 80 + (glaze !== "None" ? 10 : 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flavor || !dietary || !glaze) return alert("Please select all options");

    const product = {
      product_name: "Customized Muffin",
      category: "Muffins",
      flavor,
      dietary,
      glaze,
      price,
      quantity: 1,
      isCustomized: true,
    };
    addToCart(product);
    navigate("/cart");
  };

  return (
    <form className="muffin-form-container" onSubmit={handleSubmit}>
      <h2>Customize Your Muffin</h2>
      <div className="form-grid">
        <div>
          <label>Flavor:</label>
          <select value={flavor} onChange={(e) => setFlavor(e.target.value)} required>
            <option value="">-- Select Flavor --</option>
            <option>Blueberry</option>
            <option>Banana</option>
            <option>Chocolate</option>
          </select>
        </div>

        <div>
          <label>Dietary Preference:</label>
          <select value={dietary} onChange={(e) => setDietary(e.target.value)} required>
            <option value="">-- Select Dietary --</option>
            <option>None</option>
            <option>Gluten-Free</option>
            <option>Vegan</option>
          </select>
        </div>

        <div>
          <label>Glaze:</label>
          <select value={glaze} onChange={(e) => setGlaze(e.target.value)} required>
            <option value="">-- Select Glaze --</option>
            <option>None</option>
            <option>Honey</option>
            <option>Chocolate</option>
          </select>
        </div>
      </div>

      <p className="price-display"><strong>Total Price: ${price.toFixed(2)}</strong></p>

      <div className="muffin-buttons">
        <button type="submit" className="muffin-btn">Add to Cart</button>
        <button type="button" className="muffin-btn cancel" onClick={() => navigate("/user-menu")}>Cancel</button>
      </div>
    </form>
  );
};

export default MuffinForm;
