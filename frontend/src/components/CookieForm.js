import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import "./CookieForm.css";

const dietaryOptions = ["None", "Gluten-Free", "Vegan", "Nut-Free", "Dairy-Free", "Sugar-Free"];
const typeOptions = [
  "Chocolate Chip",
  "Oatmeal Raisin",
  "Sugar Cookie",
  "Double Chocolate",
  "Peanut Butter",
  "Ginger Snap",
  "Macadamia Nut",
  "Shortbread"
];
const quantityOptions = [1, 6, 12, 24, 36];
const addonOptions = [
  "Extra Chips",
  "No Sugar",
  "Frosted Top",
  "Stuffed Center",
  "Caramel Drizzle"
];

const CookieForm = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [cookieTypes, setCookieTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [cookieType, setCookieType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addon, setAddon] = useState("");
  const [dietary, setDietary] = useState("");
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products/");
        const cookies = res.data.filter(prod => prod.category === "Cookies");
        setCookieTypes(cookies.map(prod => ({ name: prod.name, basePrice: prod.price })));
      } catch (err) {
        console.error("Error fetching cookie types", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const selected = cookieTypes.find(c => c.name === selectedType);
    if (selected) {
      const base = Number(selected.basePrice) || 0;
      const addonPrice = addon ? 1.5 : 0;
      const total = (base + addonPrice) * quantity;
      setPrice(total);
    }
  }, [selectedType, quantity, addon, cookieTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType || !cookieType || !quantity) return alert("Please fill out all required fields");

    const customCookie = {
      product_name: selectedType || "Custom Cookie",
      category: "Cookies",
      type: cookieType,
      dietaryPref: dietary,
      addon,
      quantity,
      price,
      isCustomized: true,
    };

    addToCart(customCookie);
    alert("Cookie(s) added to cart!");
    navigate("/cart");
  };

  return (
    <form className="cookie-form-container" onSubmit={handleSubmit}>
      <h2>Customize Your Cookies</h2>

      <div className="form-grid">
        <div>
          <label>Product:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} required>
            <option value="">-- Select Product --</option>
            {cookieTypes.map((cookie, idx) => (
              <option key={idx} value={cookie.name}>{cookie.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Type:</label>
          <select value={cookieType} onChange={(e) => setCookieType(e.target.value)} required>
            <option value="">-- Select Cookie Type --</option>
            {typeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Quantity:</label>
          <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required>
            {quantityOptions.map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Dietary Preference:</label>
          <select value={dietary} onChange={(e) => setDietary(e.target.value)}>
            {dietaryOptions.map(opt => (
              <option key={opt} value={opt === "None" ? "" : opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Add-ons:</label>
          <select value={addon} onChange={(e) => setAddon(e.target.value)}>
            <option value="">-- Select Add-on --</option>
            {addonOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="price-display"><strong>Total Price: ${price.toFixed(2)}</strong></p>

      <div className="cookie-buttons">
        <button type="submit" className="cookie-btn">Add to Cart</button>
        <button type="button" className="cookie-btn cancel" onClick={() => navigate("/user-menu")}>Cancel</button>
      </div>
    </form>
  );
};

export default CookieForm;
