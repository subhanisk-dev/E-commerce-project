import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  async function fetchCart() {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://127.0.0.1:5000/api/cart/view",
        { withCredentials: true }
      );
      setCartItems(res.data.cart_items || []);
      setSummary(res.data.summary);
      setMessage("");
    } catch (error) {
      setCartItems([]);
      setSummary(null);
      setMessage(error.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function updateQuantity(itemid, quantity) {
    if (quantity <= 0) return;
    try {
      await axios.put(
        "http://127.0.0.1:5000/api/cart/update",
        { itemid, quantity },
        { withCredentials: true }
      );
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  }

  async function removeItem(itemid) {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/cart/remove/${itemid}`,
        { withCredentials: true }
      );
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message || "Remove failed");
    }
  }

  if (loading) {
    return (
      <>
        <style>{`
          .cart-loading {
            min-height: 100vh;
            background: #0f172a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          .cart-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(56,189,248,0.2);
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .cart-loading p { color: #94a3b8; font-size: 16px; }
        `}</style>
        <div className="cart-loading">
          <div className="cart-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .cart-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 60px;
        }

        .cart-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 36px 20px 28px;
          text-align: center;
        }

        .cart-hero h1 {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 6px;
        }

        .cart-hero p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .cart-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 30px 16px 0;
        }

        .cart-alert {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          color: #92400e;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .cart-empty {
          text-align: center;
          padding: 80px 20px;
          color: #94a3b8;
        }

        .cart-empty-icon {
          font-size: 56px;
          margin-bottom: 14px;
        }

        .cart-empty h3 {
          font-size: 22px;
          color: #475569;
          margin-bottom: 8px;
        }

        .cart-empty p {
          font-size: 14px;
          margin-bottom: 24px;
        }

        .cart-empty-btn {
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 28px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .cart-empty-btn:hover {
          background: #38bdf8;
        }

        /* CART ITEMS */
        .cart-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }

        .cart-row {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: box-shadow 0.2s;
        }

        .cart-row:hover {
          box-shadow: 0 6px 20px rgba(15,23,42,0.08);
        }

        .cart-row-img {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          object-fit: cover;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .cart-row-img-placeholder {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }

        .cart-row-info {
          flex: 1;
          min-width: 0;
        }

        .cart-row-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .cart-row-price {
          font-size: 13px;
          color: #64748b;
        }

        .qty-control {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          line-height: 1;
        }

        .qty-btn:hover {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .qty-value {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          min-width: 24px;
          text-align: center;
        }

        .cart-row-total {
          font-size: 16px;
          font-weight: 800;
          color: #10b981;
          flex-shrink: 0;
          min-width: 72px;
          text-align: right;
        }

        .remove-btn {
          background: #fff1f2;
          border: 1.5px solid #fecdd3;
          color: #e11d48;
          border-radius: 8px;
          width: 34px;
          height: 34px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          background: #e11d48;
          color: white;
          border-color: #e11d48;
        }

        /* SUMMARY CARD */
        .cart-summary {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 26px 28px;
        }

        .cart-summary h3 {
          font-size: 16px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 18px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          color: #475569;
          margin-bottom: 10px;
        }

        .summary-divider {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 14px 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }

        .summary-total span:last-child {
          color: #10b981;
        }

        .checkout-btn {
          width: 100%;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.2s;
        }

        .checkout-btn:hover {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          box-shadow: 0 6px 20px rgba(14,165,233,0.4);
          transform: translateY(-1px);
        }

        @media(max-width: 600px) {
          .cart-row { flex-wrap: wrap; gap: 12px; }
          .cart-row-total { min-width: auto; }
          .cart-summary { padding: 20px 16px; }
        }
      `}</style>

      <div className="cart-page">

        {/* HERO */}
        <div className="cart-hero">
          <h1>🛒 My Cart</h1>
          <p>{cartItems.length > 0 ? `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} in your cart` : "Your cart is empty"}</p>
        </div>

        <div className="cart-content">

          {message && <div className="cart-alert">⚠️ {message}</div>}

          {cartItems.length === 0 && !message ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <h3>Nothing here yet</h3>
              <p>Add some products to your cart and they'll show up here.</p>
              <button
                className="cart-empty-btn"
                onClick={() => navigate("/produce")}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* CART ITEMS */}
              <div className="cart-list">
                {cartItems.map((item) => (
                  <div className="cart-row" key={item.itemid}>

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.itemname}
                        className="cart-row-img"
                      />
                    ) : (
                      <div className="cart-row-img-placeholder">📦</div>
                    )}

                    <div className="cart-row-info">
                      <p className="cart-row-name" title={item.itemname}>
                        {item.itemname}
                      </p>
                      <p className="cart-row-price">₹{item.price} each</p>
                    </div>

                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemid, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemid, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-row-total">₹{item.total}</span>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.itemid)}
                      title="Remove item"
                    >
                      ✕
                    </button>

                  </div>
                ))}
              </div>

              {/* SUMMARY */}
              {summary && (
                <div className="cart-summary">
                  <h3>Order Summary</h3>

                  <div className="summary-row">
                    <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
                    <span>₹{summary.subtotal}</span>
                  </div>

                  <div className="summary-row">
                    <span>Delivery</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>40</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
                    <span>₹{summary.tax}</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-total">
                    <span>Grand Total</span>
                    <span>₹{summary.grand_total}</span>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() => navigate("/payment", { state: { type: "cart" } })}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default Cart;