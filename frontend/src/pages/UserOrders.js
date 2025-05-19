import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserOrders.css";

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token || role !== "user") {
      navigate("/login");
    } else {
      fetchUserOrders(token);
    }
  }, [navigate]);

  const fetchUserOrders = async (token) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/user-orders/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // Sort orders by date descending
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(data);
      } else {
        console.error("Failed to fetch orders", data);
      }
    } catch (err) {
      console.error("Error fetching user orders", err);
    }
  };

  return (
    <div className="user-orders-page">
      {/* HEADER */}
      <header className="header">
        <h1>Welcome to Mix & Match Bakery</h1>
        <nav className="navbar">
          <ul className="nav-links">
            <li>
              <button onClick={() => navigate("/user-dashboard")} className="nav-btn">
                Dashboard
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* PAGE CONTENT */}
      <div className="orders-content">
        <h2 className="orders-title">Your Orders</h2>

        {orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product(s)</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Points Earned</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {order.products
                      ? order.products.map((p) => p.name).join(", ")
                      : order.product_name || "N/A"}
                  </td>
                  <td>{order.quantity || "N/A"}</td>
                  <td>${order.total}</td>
                  <td>{order.status}</td>
                  <td>{Math.floor(parseFloat(order.total) / 10)}</td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-orders-msg">No orders found yet.</p>
        )}
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2024 Mix and Match Bakery. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default UserOrders;
