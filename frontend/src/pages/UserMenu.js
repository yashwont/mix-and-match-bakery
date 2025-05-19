import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./UserMenu.css";

const UserMenu = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProducts = async () => {
    const token = localStorage.getItem("access");

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/products/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(response.data);
    } catch (error) {
      console.error(" Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    fetchProducts(); // Initial fetch

    const interval = setInterval(fetchProducts, 10000); // Polling every 10s

    if (location.state?.refresh) {
      fetchProducts(); // Optional manual trigger
    }

    return () => clearInterval(interval);
  }, [location.state]);

  const filteredItems = items.filter(item => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="user-menu">
      <header className="menu-header">
        <h1> Mix & Match Menu</h1>
        <nav className="menu-nav">
          <button onClick={() => navigate("/user-dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/customize-form")}>Customize</button>
          <button onClick={() => navigate("/cart")}>Cart</button>
        </nav>
      </header>

      <div className="menu-controls">
        <div className="menu-categories">
          {['All', 'Cakes', 'Cookies', 'Pastries', 'Muffins', 'Breads', 'Brownies'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={category === cat ? "active" : ""}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search"
          />
        </div>
      </div>

      <div className="menu-items">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div className="menu-item-card" key={item.id}>
              {item.image_url && <img src={item.image_url} alt={item.name} />}
              <h3>{item.name}</h3>
              <p>${parseFloat(item.price).toFixed(2)}</p>
              <button onClick={() => navigate("/product-details", { state: { item } })}>View</button>
            </div>
          ))
        ) : (
          <p>No items found for this category or search.</p>
        )}
      </div>

      <footer className="menu-footer">
        <p>© 2024 Mix and Match Bakery</p>
      </footer>
    </div>
  );
};

export default UserMenu;
