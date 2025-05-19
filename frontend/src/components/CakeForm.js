import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import "./CakeForm.css";

const dietaryOptions = ["None", "Gluten-Free", "Vegan", "Nut-Free", "Dairy-Free", "Sugar-Free"];
const toppingOptions = ["Sprinkles", "Choco Chips", "Fruit Slices", "Berries", "Ganache", "Meringue", "Almonds", "Marzipan"];
const layerOptions = ["1 Layer", "2 Layers", "3 Layers", "4 Layers"];
const baseOptions = ["Chocolate", "Vanilla", "Red Velvet", "Black Forest", "Carrot Cake", "Lemon", "Coffee", "Marble"];
const messageOptions = ["Happy Birthday!", "Congratulations!", "Best Wishes!", "Happy Anniversary!", "Enjoy Your Day!"];

const CakeForm = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [cakeTypes, setCakeTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [base, setBase] = useState("");
  const [layers, setLayers] = useState("");
  const [topping, setTopping] = useState("");
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products/");
        const cakes = res.data.filter(prod => prod.category === "Cakes");
        setCakeTypes(cakes.map(prod => ({ name: prod.name, basePrice: prod.price })));
      } catch (err) {
        console.error("Error fetching cake types", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const selected = cakeTypes.find(c => c.name === selectedType);
    if (selected) {
      const basePrice = Number(selected.basePrice) || 0;
      const layerPrice = layerOptions.indexOf(layers) * 5;
      const toppingPrice = topping ? 2 : 0;
      const total = basePrice + layerPrice + toppingPrice;
      setPrice(total);
    }
  }, [selectedType, layers, topping, cakeTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType || !base || !layers) return alert("Please select all required fields.");

    const customCake = {
      product_name: selectedType || "Custom Cake",
      category: "Cakes",
      base,
      layers,
      topping,
      dietary,
      message,
      price,
      quantity: 1,
      isCustomized: true,
    };
    addToCart(customCake);
    alert("Cake added to cart!");
    navigate("/cart");
  };

  return (
    <form className="cake-form-container" onSubmit={handleSubmit}>
      <h2>Customize Your Cake</h2>
      <div className="form-grid">
        <div>
          <label>Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">-- Select Type --</option>
            {cakeTypes.map((cake, index) => (
              <option key={index} value={cake.name}>{cake.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Dietary Preference</label>
          <select value={dietary} onChange={(e) => setDietary(e.target.value)}>
            {dietaryOptions.map(opt => (
              <option key={opt} value={opt === "None" ? "" : opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Cake Base</label>
          <select value={base} onChange={(e) => setBase(e.target.value)}>
            <option value="">-- Select Base --</option>
            {baseOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Layers</label>
          <select value={layers} onChange={(e) => setLayers(e.target.value)}>
            <option value="">-- Select Layers --</option>
            {layerOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Topping</label>
          <select value={topping} onChange={(e) => setTopping(e.target.value)}>
            <option value="">-- Select Topping --</option>
            {toppingOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Message</label>
          <select value={message} onChange={(e) => setMessage(e.target.value)}>
            <option value="">-- Select Message --</option>
            {messageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="price-display"><strong>Total Price: ${price.toFixed(2)}</strong></p>

      <div className="cake-button-group">
        <button type="submit" className="cake-btn">Add to Cart</button>
        <button type="button" className="cake-btn cancel" onClick={() => navigate("/user-menu")}>Cancel</button>
      </div>
    </form>
  );
};

export default CakeForm;
