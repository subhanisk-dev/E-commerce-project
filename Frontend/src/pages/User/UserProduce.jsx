import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function UserProduce() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();
  const [qtyMap, setQtyMap] = useState({});
  

  const categories = [
  { label: "All",              value: "All" },
  { label: "Home Appliances",  value: "home_appliences" },
  { label: "Grocery",          value: "Grocery" },
  { label: "Fashion",          value: "Fashion" },
  { label: "Electronics",      value: "Electronics" },
  { label: "Sports",           value: "Sports" },
  { label: "Toys",             value: "Toys" },
];

  async function fetchProducts() {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/products"
      );
      const data = res.data.products || res.data;
      setProducts(data);
      setFiltered(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const cat = params.get("category");
  const search = params.get("search");

  if (search) {
    const term = search.toLowerCase();
    setActiveCategory("All");
    setFiltered(
      products.filter(p =>
        p.itemname?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      )
    );
  } else if (cat) {
    setActiveCategory(cat);
    setFiltered(products.filter(p => p.category === cat));
  } else {
    setActiveCategory("All");
    setFiltered(products);
  }
}, [location.search, products]);

  function filterByCategory(val) {
    setActiveCategory(val);
    if (val === "All") {
      setFiltered(products);
    } else {
      setFiltered(products.filter(p => p.category === val));
    }
  }
  function handleQtyChange(itemid, value) {
  setQtyMap(prev => ({
    ...prev,
    [itemid]: value
  }));
}

async function addToCart(itemid) {
  try {
    const quantity = qtyMap[itemid] || 1;

    const res = await axios.post(
      "http://localhost:5000/api/addcart",
      { itemid, quantity },
      { withCredentials: true }
    );

    alert(res.data.message);
  } catch (error) {
    console.log("ADD CART STATUS:", error.response?.status);
    console.log("ADD CART DATA:", error.response?.data);
    console.log("ADD CART ERROR:", error.message);

    alert(
      error.response?.data?.message ||
      "Failed to add item to cart"
    );
  }
}

async function handleBuyNow(product) {
  try {
    const quantity = qtyMap[product.itemid] || 1;

    navigate("/payment", {
      state: {
        type: "single",           // must match Payment page check
        itemid: product.itemid,   // passed directly in state
        quantity: quantity
      }
    });

  } catch (error) {
    alert("Buy Now Failed");
  }
}


  if (loading) {
    return (
      <>
        <style>{`
          .up-loading {
            min-height: 100vh;
            background: #0f172a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          .up-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(56,189,248,0.2);
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .up-loading p { color: #94a3b8; font-size: 16px; }
        `}</style>
        <div className="up-loading">
          <div className="up-spinner"></div>
          <p>Loading products...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .up-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 60px;
        }

        .up-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 40px 20px 30px;
          text-align: center;
          color: white;
        }

        .up-hero h1 {
          font-size: 32px;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 6px;
        }

        .up-hero p {
          color: #94a3b8;
          font-size: 15px;
          margin: 0;
        }

        .up-filter-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
          justify-content: center;
          flex-wrap: wrap;
          padding: 12px 20px;
        }

        .up-filter-bar::-webkit-scrollbar { display: none; }

        .up-cat-btn {
          border: 1.5px solid #e2e8f0;
          background: white;
          color: #475569;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .up-cat-btn:hover {
          border-color: #38bdf8;
          color: #0ea5e9;
        }

        .up-cat-btn.active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .up-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 16px 0;
        }

        .up-results-count {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .up-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 22px;
        }

        .up-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .up-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(15,23,42,0.12);
          border-color: #bae6fd;
        }

        .up-img-wrap {
          position: relative;
          overflow: hidden;
          background: #f1f5f9;
        }

        .up-img-wrap img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .up-card:hover .up-img-wrap img {
          transform: scale(1.05);
        }

        .up-category-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15,23,42,0.75);
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          backdrop-filter: blur(4px);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          z-index: 2;
        }

        /* HOVER OVERLAY */
        .up-img-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(0deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.6) 60%, transparent 100%);
          padding: 50px 16px 14px;
          transform: translateY(100%);
          transition: transform 0.35s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          z-index: 1;
        }

        .up-card:hover .up-img-overlay {
          transform: translateY(0);
        }

        .up-overlay-name {
          font-size: 15px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .up-overlay-price {
          font-size: 18px;
          font-weight: 800;
          color: #38bdf8;
          margin: 0 0 6px;
        }

        .up-overlay-cat {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .up-card-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .up-item-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .up-price {
          font-size: 20px;
          font-weight: 800;
          color: #10b981;
          margin: 8px 0 16px;
        }

        .up-price span {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          margin-left: 4px;
        }

        .up-btn-row {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .up-btn-cart {
          flex: 1;
          background: #f1f5f9;
          color: #0f172a;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 9px 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .up-btn-cart:hover {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .up-btn-buy {
          flex: 1;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 9px 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .up-btn-buy:hover {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14,165,233,0.4);
        }

        .up-empty {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .up-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .up-empty h3 {
          font-size: 20px;
          color: #475569;
          margin-bottom: 6px;
        }

        @media(max-width: 600px) {
          .up-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .up-hero h1 { font-size: 24px; }
          .up-img-wrap img { height: 160px; }
          .up-btn-row { flex-direction: column; }
        }
      `}</style>

      <div className="up-page">

        <div className="up-hero">
          <h1>🛍️ Shop with ShopEase</h1>
          <p>Discover great products at amazing prices</p>
        </div>

        <div className="up-filter-bar">
  {categories.map(cat => (
    <button
      key={cat.value}
      className={`up-cat-btn ${activeCategory === cat.value ? "active" : ""}`}
      onClick={() => filterByCategory(cat.value)}
    >
      {cat.label}
    </button>
  ))}
</div>

        <div className="up-content">
          <p className="up-results-count">
  {(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      return `Showing ${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`;
    }
    return `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}${
      activeCategory !== "All"
        ? ` in "${categories.find(c => c.value === activeCategory)?.label || activeCategory}"`
        : ""
    }`;
  })()}
</p>


          {filtered.length === 0 ? (
            <div className="up-empty">
              <div className="up-empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try selecting a different category</p>
            </div>
          ) : (
            <div className="up-grid">
              {filtered.map((product) => (
                <div className="up-card" key={product.itemid}>

                  <div className="up-img-wrap">
                    <img
                      src={product.image}
                      alt={product.itemname}
                    />
                    {product.category && (
                      <span className="up-category-tag">
                        {product.category}
                      </span>
                    )}
                    <div className="up-img-overlay">
                      <p className="up-overlay-name">{product.itemname}</p>
                      <p className="up-overlay-price">₹{product.price}</p>
                      {product.category && (
                        <span className="up-overlay-cat">{product.category}</span>
                      )}
                    </div>
                  </div>

                  <div className="up-card-body">
                    <h5 className="up-item-name" title={product.itemname}>
                      {product.itemname}
                    </h5>

                    <p className="up-price">
                      ₹{product.price}
                      <span>incl. taxes</span>
                    </p>


                                <div style={{ marginBottom: "10px" }}>
                <select
                  value={qtyMap[product.itemid] || 1}
                  onChange={(e) =>
                    handleQtyChange(product.itemid, Number(e.target.value))
                  }
                  style={{
                    width: "80px",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>
                      Qty: {num}
                    </option>
                  ))}
                </select>
              </div>

  

                    <div className="up-btn-row">
                      <button
                        className="up-btn-cart"
                        onClick={() => addToCart(product.itemid)}
                      >
                        🛒 Cart
                      </button>
                      <button
                        className="up-btn-buy"
                          onClick={() => handleBuyNow(product)}
                            
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default UserProduce;