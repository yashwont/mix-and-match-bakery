import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewUsers.css";

const ViewUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter only users with role 'user'
        const onlyUsers = response.data.filter((user) => user.role === "user");
        setUsers(onlyUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        navigate("/login");
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <div className="view-users">
      {/* Header */}
      <header className="users-header">
        <h1>👥 View All Users</h1>
        <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
          Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="users-main">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge-user">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Footer */}
      <footer className="users-footer">
        <p>© 2024 Mix and Match Bakery. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ViewUsers;
