import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axios from "../services/axiosInstance";
import "./ProductDetails.css";

const dietaryOptions = ["None", "Gluten-Free", "Vegan", "Nut-Free", "Dairy-Free", "Sugar-Free"];
const toppingOptions = ["None", "Choco Chips", "Sprinkles", "Fruit Pieces", "Nuts", "Whipped Cream"];
const flavorOptions = ["None", "Chocolate", "Vanilla", "Strawberry", "Coffee", "Lemon"];

const ProductDetails = () => {
  const { state } = useLocation();
  const { item } = state;
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [dietary, setDietary] = useState("");
  const [flavor, setFlavor] = useState("");
  const [topping, setTopping] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const isLoggedIn = !!localStorage.getItem("access");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/products/${item.id}/reviews/`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleAddToCart = () => {
    const product = {
      product_name: item.name,
      category: item.category,
      price: item.price,
      quantity: 1,
      dietary,
      flavor,
      topping,
      isCustomized: true,
    };
    addToCart(product);
    navigate("/cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/products/${item.id}/reviews/`, {
        rating: parseInt(rating),
        comment,
      });
      setMessage(" Review submitted!");
      setReviews([res.data, ...reviews]);
      setRating(5);
      setComment("");
    } catch (err) {
      setMessage("Unable to submit review.");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [item.id]);

  return (
    <div className="product-detail-page">
      <header className="product-header">
        <h1 onClick={() => navigate("/menu")}>Mix & Match Bakery</h1>
        <nav>
          <button onClick={() => navigate("/user-menu")}>Menu</button>
          <button onClick={() => navigate("/customize-form")}>Customize</button>
          <button onClick={() => navigate("/cart")}>Cart</button>
        </nav>
      </header>

      <main className="product-content">
        <div className="product-container">
          <div className="product-img">
            <img src={item.image_url} alt={item.name} />
          </div>

          <div className="product-customize">
            <h2>{item.name}</h2>
            <p className="product-price">${item.price}</p>

            <label>Dietary Preference</label>
            <select value={dietary} onChange={(e) => setDietary(e.target.value)}>
              {dietaryOptions.map(opt => (
                <option key={opt} value={opt === "None" ? "" : opt}>{opt}</option>
              ))}
            </select>

            <label>Flavor</label>
            <select value={flavor} onChange={(e) => setFlavor(e.target.value)}>
              {flavorOptions.map(opt => (
                <option key={opt} value={opt === "None" ? "" : opt}>{opt}</option>
              ))}
            </select>

            <label>Topping</label>
            <select value={topping} onChange={(e) => setTopping(e.target.value)}>
              {toppingOptions.map(opt => (
                <option key={opt} value={opt === "None" ? "" : opt}>{opt}</option>
              ))}
            </select>

            <button className="cart-btn" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </main>

      <section className="review-container">
        <div className="review-box">
          <h3>Customer Reviews</h3>
          {reviews.length === 0 && <p>No reviews yet.</p>}
          {reviews.map((rev, idx) => (
            <div key={idx} className="review">
              <strong>{rev.user}</strong> — ⭐ {rev.rating}
              <p>{rev.comment}</p>
            </div>
          ))}
        </div>

        <div className="review-form-box">
          {isLoggedIn ? (
            <form className="review-form" onSubmit={submitReview}>
              <label>Rating</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review"
                required
              />
              <button type="submit">Submit Review</button>
              {message && <p className="form-message">{message}</p>}
            </form>
          ) : (
            <p>Please <span className="login-link" onClick={() => navigate("/login")}>log in</span> to leave a review.</p>
          )}
        </div>
      </section>

      <footer className="product-footer">
        <p>© 2024 Mix and Match Bakery</p>
      </footer>
    </div>
  );
};

export default ProductDetails;
