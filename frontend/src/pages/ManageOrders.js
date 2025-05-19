import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageOrders.css";

const API_URL = "http://127.0.0.1:8000/api/orders/";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("access");

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("access");
        navigate("/login");
      } else {
        console.error("Error fetching orders:", err);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="manage-orders">
      {/* Header */}
      <header className="header">
        <h1> Manage Orders</h1>
        <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
          Dashboard
        </button>
      </header>

      {/* Orders Table */}
      <main className="orders-main">
        <table className="order-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Product</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Customized</th>
              <th>Dietary</th>
              <th>Flavor</th>
              <th>Topping</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer_name}</td>
                <td>{order.customer_phone}</td>
                <td>{order.customer_address || "-"}</td>
                <td>{order.product_name}</td>
                <td>{order.category}</td>
                <td>{order.quantity}</td>
                <td>${parseFloat(order.price).toFixed(2)}</td>
                <td>{order.is_customized ? "✅" : "❌"}</td>
                <td>{order.dietary || '-'}</td>
                <td>{order.flavor || '-'}</td>
                <td>{order.topping || '-'}</td>
                <td>{new Date(order.order_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Footer */}
      <footer className="orders-footer">
        <p>© 2024 Mix and Match Bakery. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ManageOrders;
