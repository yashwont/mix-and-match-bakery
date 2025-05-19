import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Signup from "./components/Signup";
import Login from "./components/Login";
import SetPassword from "./components/SetPassword.js";
import ForgotPassword from "./components/ForgotPassword.js";
import ResetPassword from "./components/ResetPassword";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFail from "./components/PaymentFail";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile.js";
import ViewProfile from "./pages/ViewProfile";
import UserOrders from "./pages/UserOrders.js";
import ViewUsers from "./pages/ViewUsers.js";
import UserMenu from "./pages/UserMenu.js";
import ManageProducts from "./pages/ManageProducts.js";
import ManageOrders from "./pages/ManageOrders.js";
import ProductDetails from "./pages/ProductDetails.js";
import Cart from "./pages/Cart.js";
import CustomizationForm from "./pages/CustomizationForm.js";
import Checkout from "./pages/Checkout.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token/" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-fail" element={<PaymentFail />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/user-orders" element={<UserOrders />} />
        <Route path="/view-users" element={<ViewUsers />} />
        <Route path="/user-menu" element={<UserMenu />} />
        <Route path="/manage-products" element={<ManageProducts />} />
        <Route path="/manage-orders" element={<ManageOrders />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path='/customize-form' element={<CustomizationForm />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
