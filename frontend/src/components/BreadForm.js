import React, { useState, useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./BreadForm.css";

const dietaryOptions = ["None", "Gluten-Free", "Vegan", "Nut-Free"];
const typeOptions = [
  { label: "Whole Wheat", price: 3 },
  { label: "Multigrain", price: 4 },
  { label: "Garlic", price: 4.5 }
];
const sizeOptions = [
  { label: "Small", price: 0 },
  { label: "Medium", price: 1 },
  { label: "Large", price: 2 }
];
const toppingOptions = [
  { label: "Sesame Seeds", price: 0.5 },
  { label: "Oregano", price: 0.75 },
  { label: "Cheese Crust", price: 1.25 }
];

const BreadForm = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [topping, setTopping] = useState("");
  const [dietary, setDietary] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const basePrice = parseFloat(typeOptions.find(opt => opt.label === type)?.price || 0);
    const sizePrice = parseFloat(sizeOptions.find(opt => opt.label === size)?.price || 0);
    const toppingPrice = parseFloat(toppingOptions.find(opt => opt.label === topping)?.price || 0);
    setTotal(basePrice + sizePrice + toppingPrice);
  }, [type, size, topping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !size) return alert("Please select type and size");

    const product = {
      product_name: "Customized Bread",
      category: "Breads",
      type,
      size,
      topping,
      dietary,
      price: total,
      quantity: 1,
      isCustomized: true,
    };
    addToCart(product);
    navigate("/cart");
  };

  return (
    <form className="bread-form-container" onSubmit={handleSubmit}>
      <h2>Customize Your Bread</h2>

      <div className="form-grid">
        <div>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">-- Select Type --</option>
            {typeOptions.map(opt => (
              <option key={opt.label} value={opt.label}>
                {opt.label} (+${opt.price})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Size:</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} required>
            <option value="">-- Select Size --</option>
            {sizeOptions.map(opt => (
              <option key={opt.label} value={opt.label}>
                {opt.label} (+${opt.price})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Topping:</label>
          <select value={topping} onChange={(e) => setTopping(e.target.value)}>
            <option value="">-- Select Topping --</option>
            {toppingOptions.map(opt => (
              <option key={opt.label} value={opt.label}>
                {opt.label} (+${opt.price})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Dietary Preference:</label>
          <select value={dietary} onChange={(e) => setDietary(e.target.value)}>
            {dietaryOptions.map(opt => (
              <option key={opt} value={opt === "None" ? "" : opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="bread-price">Total Price: ${total.toFixed(2)}</p>

      <div className="bread-buttons">
        <button type="submit" className="bread-btn">Add to Cart</button>
        <button type="button" className="bread-btn cancel" onClick={() => navigate("/user-menu")}>Cancel</button>
      </div>
    </form>
  );
};

export default BreadForm;
