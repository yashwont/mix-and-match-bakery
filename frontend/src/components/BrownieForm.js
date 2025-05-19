import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import "./BrownieForm.css";

const dietaryOptions = ["None", "Gluten-Free", "Vegan", "Nut-Free", "Dairy-Free", "Sugar-Free"];
const baseOptions = [
  { label: "Classic", price: 5 },
  { label: "Fudge", price: 6 },
  { label: "Salted Caramel", price: 6.5 },
  { label: "Chocolate Chip", price: 6 },
  { label: "Espresso", price: 7 }
];
const nutOptions = [
  { label: "None", price: 0 },
  { label: "Walnuts", price: 1 },
  { label: "Pecans", price: 1.5 },
  { label: "Hazelnuts", price: 2 }
];
const toppingOptions = [
  { label: "None", price: 0 },
  { label: "Choco Drizzle", price: 1 },
  { label: "Whipped Cream", price: 1.5 },
  { label: "Marshmallow Bits", price: 1.2 }
];

const BrownieForm = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [base, setBase] = useState("");
  const [nuts, setNuts] = useState("");
  const [topping, setTopping] = useState("");
  const [dietary, setDietary] = useState("");
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products/");
        const brownies = res.data.filter((p) => p.category === "Brownies");
        setProducts(brownies.map((p) => ({ name: p.name, basePrice: p.price })));
      } catch (err) {
        console.error("Error fetching brownies", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const selected = products.find((p) => p.name === selectedProduct);
    if (selected) {
      const basePrice = Number(baseOptions.find(opt => opt.label === base)?.price || 0);
      const nutPrice = Number(nutOptions.find(opt => opt.label === nuts)?.price || 0);
      const toppingPrice = Number(toppingOptions.find(opt => opt.label === topping)?.price || 0);
      const total = Number(selected.basePrice || 0) + basePrice + nutPrice + toppingPrice;
      setPrice(total);
    }
  }, [selectedProduct, base, nuts, topping, products]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !base) return alert("Please fill out all required fields");

    const customBrownie = {
      product_name: selectedProduct || "Custom Brownie",
      category: "Brownies",
      dietaryPref: dietary,
      base,
      nuts,
      topping,
      price,
      isCustomized: true,
    };

    addToCart(customBrownie);
    alert("Brownie added to cart!");
    navigate("/cart");
  };

  return (
    <div className="brownie-form-container">
      <h2>Customize Your Brownies</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div>
          <label>Product:</label>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">-- Select Brownie --</option>
            {products.map((p, idx) => (
              <option key={idx} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Base:</label>
          <select value={base} onChange={(e) => setBase(e.target.value)}>
            <option value="">-- Select Base --</option>
            {baseOptions.map(opt => (
              <option key={opt.label} value={opt.label}>{opt.label} (+${opt.price})</option>
            ))}
          </select>
        </div>

        <div>
          <label>Include Nuts:</label>
          <select value={nuts} onChange={(e) => setNuts(e.target.value)}>
            {nutOptions.map(opt => (
              <option key={opt.label} value={opt.label}>{opt.label} (+${opt.price})</option>
            ))}
          </select>
        </div>

        <div>
          <label>Toppings:</label>
          <select value={topping} onChange={(e) => setTopping(e.target.value)}>
            {toppingOptions.map(opt => (
              <option key={opt.label} value={opt.label}>{opt.label} (+${opt.price})</option>
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

        <div className="full-width">
          <p className="brownie-price">Total Price: ${price.toFixed(2)}</p>
          <div className="brownie-buttons">
            <button type="submit" className="brownie-btn">Add to Cart</button>
            <button type="button" className="brownie-btn cancel" onClick={() => navigate("/user-menu")}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BrownieForm;
