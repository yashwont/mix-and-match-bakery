import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/email-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        navigate(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    const token = response.credential;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        if (data.hasPassword === false) {
          navigate("/set-password");
        } else {
          navigate(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        }
      } else {
        console.warn("Google login failed:", data);
        setError(data.error || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Something went wrong with Google login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "733522699168-ld8meu8tre3f1eate0nlfqs1tjdkac27.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          {
            theme: "outline",
            size: "large",
            width: 250,
          }
        );
      }
    };

    const loadGoogleScript = () => {
      if (!window.google || !window.google.accounts) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);
      } else {
        initializeGoogle();
      }
    };

    loadGoogleScript();
  }, []);

  return (
    <>
      <header className="login-header">
        <h1>Mix & Match Bakery</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>

      <div className="auth-container">
        <div className="auth-box">
          <h2>Login to Your Account</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}

          <div className="google-login-container">
            <div id="google-login-btn"></div>
          </div>

          <p style={{ marginTop: "1rem" }}>
            <Link to="/forgot-password" style={{ textDecoration: "underline" }}>
              Forgot Password?
            </Link>
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>

      <footer className="login-footer">
        <p>© {new Date().getFullYear()} Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Login;
