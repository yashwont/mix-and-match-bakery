import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reset-password/${uidb64}/${token}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password reset successful! You can now login.");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setMessage(data.error || " Password reset failed.");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setMessage("Something went wrong.");
    }
  };

  return (
    <>
      {/*  Header */}
      <header className="login-header">
        <h1>Mix & Match Bakery</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>

      {/*  Main Form */}
      <div className="auth-container">
        <div className="auth-box">
          <h2>Reset Your Password</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
            <button
                type="button"
                onClick={() => navigate("/login")}
                style={{ flex: 1, backgroundColor: "#999", color: "#fff", border: "none", padding: "10px" }}
              >
                Cancel
              </button>
          </form>
          {message && (
            <p style={{ marginTop: "1rem", color: "darkblue" }}>{message}</p>
          )}
        </div>
      </div>

      {/*  Footer */}
      <footer className="login-footer">
        <p>© {new Date().getFullYear()} Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </>
  );
};

export default ResetPassword;