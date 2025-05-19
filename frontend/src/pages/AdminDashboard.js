import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationsDropdown from "../components/NotifiicationsDropdown";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("access");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header className="admin-header">
        <h1> Admin Dashboard</h1>
        <div><li><NotificationsDropdown /></li></div>
      </header>

      <div className="dashboard-content">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <button className="sidebar-btn" onClick={() => navigate("/manage-orders")}>
            Manage Orders
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/manage-products")}>
            Manage Products
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/view-users")}>
            View Users
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/profile")}>
            View Profile
          </button>
          <button className="sidebar-btn logout-btn" onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}>
            Log Out
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <section className="admin-welcome">
            <h2>Welcome, Admin!</h2>
            <p>Manage your bakery with ease!</p>
          </section>

          <section className="admin-stats">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p>{orders.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>${orders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0).toFixed(2)}</p>
            </div>
          </section>

          <section className="admin-recent-orders">
            <h2>Recent Orders</h2>
            {loading ? (
              <p>Loading...</p>
            ) : orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.product_name}</td>
                      <td>{order.quantity}</td>
                      <td>${parseFloat(order.price).toFixed(2)}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="admin-footer">
        <p>© 2024 Mix and Match Bakery. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
