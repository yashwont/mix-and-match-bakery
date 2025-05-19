import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    console.log("Access token being sent:", token);

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        console.log(" Response status:", res.status);
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          console.log(" Profile data:", data);
          setProfile(data);
        }
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, [navigate]);

  if (!profile) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <h1> Mix & Match Bakery</h1>
      </header>

      <div className="profile-container">
        <div className="profile-box">
          <h2>👤 Your Profile</h2>
          <div className="profile-details">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
          </div>

          <div className="profile-buttons">
            <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
              ⬅ Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <footer className="profile-footer">
        <p>© 2025 Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Profile;
