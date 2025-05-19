import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsDropdown from "../components/NotifiicationsDropdown";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
  });
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const token = localStorage.getItem("access");

    if (!storedUsername || storedRole !== "user") {
      navigate("/login");
    } else {
      setUsername(storedUsername);
      fetchUserOrders(token);
      fetchUserProfile(token);
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
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setOrders(data);
        const delivered = data.filter((o) => o.status === "Delivered").length;
        const active = data.filter((o) => o.status !== "Delivered").length;
  
        setStats({
          totalOrders: data.length,
          activeOrders: active,
          deliveredOrders: delivered,
        });
      } else {
        console.error("Failed to fetch orders", data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPoints(data.points);
      }
    } catch (err) {
      console.error("Failed to fetch profile info", err);
    }
  };

  return (
    <div className="user-dashboard">
      {/* HEADER */}
      <header className="header">
        <h1>Welcome to Mix & Match Bakery</h1>
        <nav className="navbar">
          <ul className="nav-links">
            <li><NotificationsDropdown /></li>
            <li>
              <button onClick={() => navigate("/user-menu")} className="nav-btn">
                Menu
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/customize-form")} className="nav-btn">
                Customize
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <div className="dashboard-content">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <button
            className="sidebar-btn"
            onClick={() => navigate("/view-profile")}
          >
            View Profile
          </button>
          <button
          className="sidebar-btn"
          onClick={() => navigate("/user-orders")}
          >
            My Orders
            </button>
          <button
            className="sidebar-btn logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Log Out
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <section className="welcome-section">
            <h2>Hello, {username} 👋</h2>
            <p>Welcome to the Mix and Match Bakery!</p>
          </section>

          <section className="overview">
            <h2>Your Overview</h2>
            <div className="stats">
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p>{stats.totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Active Orders</h3>
                <p>{stats.activeOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Delivered Orders</h3>
                <p>{stats.deliveredOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Reward Points</h3>
                <p>{points} pts</p>
              </div>
            </div>
          </section>

          <section className="recent-orders">
            <h2>Recent Orders</h2>
            {orders.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.product_name || "N/A"}</td>
                    <td>{order.date}</td>
                    <td>${order.total}</td>
                    <td>{order.status}</td>
                    <td>{Math.floor(parseFloat(order.total) / 10)}</td>
                    </tr>
                  ))}

                </tbody>
              </table>
            ) : (
              <p>No orders found.</p>
            )}
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2024 Mix and Match Bakery. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default UserDashboard;
