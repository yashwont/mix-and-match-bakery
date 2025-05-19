import React, { useState } from "react";
import { Link } from "react-router-dom";
import {useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/request-reset-email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Reset link has been sent to your email.");
      } else {
        setMessage(data.error || " Failed to send reset link.");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setMessage("Something went wrong!");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="login-header">
        <h1>Mix & Match Bakery</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>

      {/* Main Form */}
      <div className="auth-container">
        <div className="auth-box">
          <h2> Enter Email to sent link</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="button-group">
              <button type="submit" className="primary-btn">
                Send Reset Link
                </button>
                <button type="button" className="cancel-btn"onClick={() => navigate("/login")}>
                  Cancel
                  </button>
                  </div>

          </form>
          {message && (
            <p style={{ marginTop: "1rem", color: "darkblue" }}>{message}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p>© {new Date().getFullYear()} Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </>
  );
};

export default ForgotPassword;