import React, { useEffect } from "react";
import axios from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const submitOrder = async () => {
      const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));

      if (pendingOrder) {
        try {
          await axios.post("/api/place-order/", pendingOrder, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          });
          localStorage.removeItem("pendingOrder");
          alert(" Order confirmed after eSewa payment!");
          navigate("/user-menu");
        } catch (err) {
          console.error("Order placement after eSewa failed", err);
        }
      }
    };

    submitOrder();
  }, [navigate]);

  return <h2> Payment Successful! Placing your order...</h2>;
};

export default PaymentSuccess;
