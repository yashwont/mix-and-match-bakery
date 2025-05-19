import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./PastryForm.css";

const PastryForm = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [flavor, setFlavor] = useState("");
  const [dietary, setDietary] = useState("");
  const [filling, setFilling] = useState("");

  const price = 90 + (filling !== "None" && filling !== "" ? 15 : 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flavor || !dietary || !filling) return alert("Please select all options");

    const product = {
      product_name: "Customized Pastry",
      category: "Pastries",
      flavor,
      dietary,
      filling,
      price,
      quantity: 1,
      isCustomized: true,
    };
    addToCart(product);
    navigate("/cart");
  };

  return (
    <div className="pastry-form-container">
      <h2>Customize Your Pastry</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Flavor:</label>
          <select value={flavor} onChange={(e) => setFlavor(e.target.value)} required>
            <option value="">-- Select Flavor --</option>
            <option>Chocolate</option>
            <option>Vanilla</option>
            <option>Strawberry</option>
          </select>
        </div>

        <div>
          <label>Dietary Preference:</label>
          <select value={dietary} onChange={(e) => setDietary(e.target.value)} required>
            <option value="">-- Select Preference --</option>
            <option>None</option>
            <option>Gluten-Free</option>
            <option>Vegan</option>
          </select>
        </div>

        <div>
          <label>Filling:</label>
          <select value={filling} onChange={(e) => setFilling(e.target.value)} required>
            <option value="">-- Select Filling --</option>
            <option>None</option>
            <option>Custard</option>
            <option>Fruit Jam</option>
          </select>
        </div>

        <div className="full-width">
          <p className="pastry-price">Total Price: ${price.toFixed(2)}</p>
          <div className="pastry-buttons">
            <button type="submit" className="pastry-btn">Add to Cart</button>
            <button type="button" className="pastry-btn cancel" onClick={() => navigate("/customize-form")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PastryForm;
