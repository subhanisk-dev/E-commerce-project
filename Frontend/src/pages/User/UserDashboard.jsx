import React from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const quickLinks = [
    {
      icon: "🛍️",
      title: "Browse Products",
      desc: "Explore our full catalogue",
      action: () => navigate("/produce"),
      color: "#6366f1",
      bg: "#eef2ff"
    },
    {
      icon: "🛒",
      title: "My Cart",
      desc: "View items in your cart",
      action: () => navigate("/cart"),
      color: "#0ea5e9",
      bg: "#e0f2fe"
    },
    {
      icon: "📦",
      title: "My Orders",
      desc: "Track your recent orders",
      action: () => navigate("/my-orders"),
      color: "#10b981",
      bg: "#d1fae5"
    },
    {
      icon: "👗",
      title: "Fashion",
      desc: "Trending styles just for you",
      action: () => navigate("/produce?category=Fashion"),
      color: "#f43f5e",
      bg: "#ffe4e6"
    },
    {
      icon: "📱",
      title: "Electronics",
      desc: "Latest gadgets & tech",
      action: () => navigate("/produce?category=Electronics"),
      color: "#f59e0b",
      bg: "#fef3c7"
    },
    {
      icon: "🏠",
      title: "Home Appliances",
      desc: "Everything for your home",
      action: () => navigate("/produce?category=home_appliences"),
      color: "#8b5cf6",
      bg: "#ede9fe"
    }
  ];

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <style>{`
        .ud-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          padding: 40px 20px 60px;
        }

        .ud-header-card {
          background: linear-gradient(135deg, #1e3a5f, #0f172a);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 20px;
          padding: 36px 40px;
          color: white;
          margin-bottom: 36px;
          position: relative;
          overflow: hidden;
        }

        .ud-header-card::before {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(56,189,248,0.15), transparent 70%);
          border-radius: 50%;
        }

        .ud-greeting {
          font-size: 14px;
          color: #38bdf8;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .ud-name {
          font-size: 34px;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 6px;
        }

        .ud-email {
          font-size: 15px;
          color: #94a3b8;
        }

        .ud-badge {
          display: inline-block;
          background: rgba(56,189,248,0.15);
          color: #38bdf8;
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 14px;
        }

        .ud-section-title {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .ud-card {
          background: white;
          border-radius: 16px;
          padding: 22px 20px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.25s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ud-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          border-color: var(--card-color);
        }

        .ud-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: var(--card-bg);
        }

        .ud-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .ud-card-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .ud-arrow {
          margin-top: auto;
          font-size: 18px;
          color: var(--card-color);
          font-weight: bold;
        }

        @media(max-width: 768px) {
          .ud-name { font-size: 26px; }
          .ud-header-card { padding: 26px 22px; }
        }
      `}</style>

      <div className="ud-page">
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>

          {/* HEADER */}
          <div className="ud-header-card">
            <p className="ud-greeting">Welcome back</p>
            <h1 className="ud-name">{user?.username || "Shopper"} 👋</h1>
            <p className="ud-email">{user?.useremail}</p>
            <span className="ud-badge">✦ Verified Member</span>
          </div>

          {/* QUICK LINKS */}
          <p className="ud-section-title">Quick Actions</p>
          <div className="row g-3">
            {quickLinks.map((item, i) => (
              <div className="col-6 col-md-4" key={i}>
                <div
                  className="ud-card"
                  style={{
                    "--card-color": item.color,
                    "--card-bg": item.bg
                  }}
                  onClick={item.action}
                >
                  <div className="ud-card-icon">{item.icon}</div>
                  <p className="ud-card-title">{item.title}</p>
                  <p className="ud-card-desc">{item.desc}</p>
                  <span className="ud-arrow">→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

export default UserDashboard;