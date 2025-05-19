import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("access");

      const res = await fetch("http://127.0.0.1:8000/api/set-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(" Password set successfully!");
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 1500);
      } else {
        setError(data.error || " Failed to set password.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Set Your Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Setting..." : "Set Password"}
          </button>
        </form>
        {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
        {error && <p style={{ color: "crimson", marginTop: "1rem" }}>{error}</p>}
      </div>
    </div>
  );
};

export default SetPassword;
