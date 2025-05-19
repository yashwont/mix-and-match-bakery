import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CakeForm from '../components/CakeForm';
import CookieForm from '../components/CookieForm';
import MuffinForm from '../components/MuffinForm';
import BrownieForm from '../components/BrownieForm';
import PastryForm from '../components/PastryForm';
import BreadForm from '../components/BreadForm';
import './Customize.css';

const categories = ['Cakes', 'Cookies', 'Muffins', 'Brownies', 'Pastries', 'Breads'];

const CustomizationForm = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const renderForm = () => {
    switch (selectedCategory) {
      case 'Cakes': return <CakeForm />;
      case 'Cookies': return <CookieForm />;
      case 'Muffins': return <MuffinForm />;
      case 'Brownies': return <BrownieForm />;
      case 'Pastries': return <PastryForm />;
      case 'Breads': return <BreadForm />;
      default: return <p style={{ padding: '1rem' }}>Please select a category to begin customization.</p>;
    }
  };

  return (
    <div className="customize-page">
      <header className="customize-header">
        <h1 onClick={() => navigate("/user-menu")}>🥐 Mix & Match Bakery</h1>
        <nav className="customize-nav">
          <button onClick={() => navigate("/user-menu")}>Menu</button>
          <button onClick={() => navigate("/cart")}>Cart</button>
          <button className="active">Customize</button>
        </nav>
      </header>

      <div className="customize-body">
        <aside className="sidebar">
          <h2>Categories</h2>
          <ul>
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'active' : ''}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="form-area">
          <h2>Customize Your {selectedCategory || "Item"}</h2>
          {renderForm()}
        </main>
      </div>

      <footer className="customize-footer">
        <p>© 2024 Mix & Match Bakery. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CustomizationForm;
