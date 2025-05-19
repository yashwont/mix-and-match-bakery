import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosInstance";
import "./NotificationsDropdown.css";

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("/api/notifications/", {  // Only /notifications/ because axiosInstance baseURL = /api
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access");
  
      const target = notifications.find((n) => n.id === id);
      if (!target || target.is_read) return;
  
      await axios.patch(`/api/notifications/${id}/`, { is_read: true }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
  
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
  
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.warn(`Notification ${id} not found or access denied.`);
        fetchNotifications(); 
      } else {
        console.error("Failed to mark notification as read", err);
      }
    }
  };
  

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} className="notification-bell">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p style={{ padding: "10px", textAlign: "center" }}>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.is_read ? "read" : ""}`}
                onClick={() => markAsRead(n.id)}
              >
                <div className="notification-title">{n.title}</div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-timestamp">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
