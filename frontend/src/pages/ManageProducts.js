import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageProducts.css";

const API_URL = "http://127.0.0.1:8000/api/products/";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", quantity: "", image: null });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("access");

  const fetchProducts = async () => {
    const token = getToken();
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    const delayFetch = setTimeout(() => {
      fetchProducts();
    }, 100);
    return () => clearTimeout(delayFetch);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData();

    for (let key in form) {
      if (key === "image" && !form[key]) continue;
      if (form[key] !== "") formData.append(key, form[key]);
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}${editId}/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchProducts();
      setForm({ name: "", price: "", category: "", quantity: "", image: null });
      setEditId(null);
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = getToken();
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: product.quantity,
      image: null,
    });
    setEditId(product.id);
  };

  return (
    <div className="manage-products">
      {/* Header */}
      <header className="header">
        <h1>🛒 Manage Products</h1>
        <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
          Dashboard
        </button>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="product-form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="Price" required />
        <input name="quantity" value={form.quantity} onChange={handleChange} type="number" placeholder="Quantity" required />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option>Cakes</option>
          <option>Cookies</option>
          <option>Pastries</option>
          <option>Muffins</option>
          <option>Breads</option>
          <option>Brownies</option>
        </select>
        <input name="image" type="file" onChange={handleChange} accept="image/*" />
        <button type="submit">{editId ? "Update" : "Add"} Product</button>
      </form>

      {/* Products Table */}
      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Category</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>${parseFloat(product.price).toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>{product.category}</td>
              <td>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} height={50} />
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(product)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <footer className="products-footer">
        <p>© 2024 Mix and Match Bakery. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ManageProducts;
