import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const type = location.state?.type; // "cart" or "single"
  const itemid = location.state?.itemid;
  const quantity = location.state?.quantity || 1;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handlePayment() {
    try {
      setLoading(true);

      // STEP 1: CREATE ORDER
      const orderRes = await axios.post(
        "http://127.0.0.1:5000/api/payment/create-order",
        type === "cart"
          ? { type: "cart" }
          : { type: "single", itemid, quantity },
        { withCredentials: true }
      );

      const data = orderRes.data;

      const options = {
        key: data.razorpay_key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.order_id,

        name: "ShopEase",
        description: "Order Payment",

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              "http://127.0.0.1:5000/api/payment/verify",
              type === "cart"
                ? {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    mode: "cart"
                  }
                : {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    mode: "single",
                    itemid,
                    quantity
                  },
              { withCredentials: true }
            );

            alert(verifyRes.data.message);

            navigate("/my-orders");
          } catch (err) {
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#0f172a"
        }
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h2>Payment</h2>

        <p>Type: {type}</p>

        {type === "single" && (
          <>
            <p>Item ID: {itemid}</p>
            <p>Quantity: {quantity}</p>
          </>
        )}

        <button
          className="btn btn-success"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}

export default Payment;