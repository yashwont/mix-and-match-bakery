// src/components/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">Mix & Match Bakery</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Delicious Customizable Treats </h2>
        <p>Design your perfect pastry, cake, or cookie just the way you like it.</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn">Explore Bakery</Link>
          <Link to="/signup" className="btn primary">Get Started</Link>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured">
        <h3>Our Favorites</h3>
        <div className="product-preview">
          <div className="card">
          <img src="https://tse3.mm.bing.net/th?id=OIP.gkTfTTmmz12oJyJ-0WmEwwHaLH&pid=Api&P=0&h=180" alt="Placeholder" />
            <h4>Custom Cakes</h4>
            <p>Create your dream cake with flavors, layers, and designs.</p>
          </div>
          <div className="card">
          <img src="https://tse3.mm.bing.net/th?id=OIP.gvpqe3p7bM-Boz-sPm2pJAHaLG&pid=Api&P=0&h=180" alt="Placeholder" />
            <h4>Cookies</h4>
            <p>Pick your base, mix-ins, and size!</p>
          </div>
          <div className="card">
          <img src="https://sallysbakingaddiction.com/wp-content/uploads/2022/12/super-seeded-oat-bread-2.jpg" alt="Placeholder" />
            <h4>Fresh Breads</h4>
            <p>Choose from artisan styles with optional seeds or toppings.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div> Choose Product</div>
          <div> Customize</div>
          <div> Place Order</div>
          <div> Get it Delivered</div>
        </div>
      </section>

      {/* About Us */}
      <section className="about">
        <h3>About Mix & Match Bakery</h3>
        <p>We're a small team of passionate bakers and techies, creating personalized bakery experiences for every sweet tooth. Your cravings, your way!</p>
      </section>

      {/* Footer */}
      <footer>
        <p>© {new Date().getFullYear()} Mix & Match Bakery. All rights reserved.</p>
        <p>9843028023</p>
        <div className="socials">
          <a href="/">Instagram</a> | <a href="/">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
