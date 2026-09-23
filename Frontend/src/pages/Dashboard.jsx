import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

const admin = JSON.parse(
  localStorage.getItem("admin") || "{}"
);
  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <style>{`
        .dashboard-container{
          min-height:100vh;
          background:#f1f5f9;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:20px;
        }

        .dashboard-card{
          background:white;
          border-radius:20px;
          padding:40px;
          width:100%;
          max-width:700px;
          box-shadow:0 8px 20px rgba(0,0,0,0.1);
        }

        .dashboard-title{
          color:#0f172a;
          font-size:38px;
          font-weight:bold;
        }

        .welcome-text{
          color:#38bdf8;
          font-weight:600;
          margin-top:20px;
        }

        .user-info{
          color:#475569;
          font-size:18px;
        }

        .dashboard-btn{
          background:#0f172a;
          color:white;
          border:none;
          padding:12px 25px;
          border-radius:10px;
          font-size:17px;
        }

        @media(max-width:768px){
          .dashboard-card{
            padding:25px;
          }

          .dashboard-title{
            font-size:30px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-card">

          <h1 className="dashboard-title">
            User Dashboard
          </h1>


<h3 className="welcome-text">
  Welcome: {admin?.adminemail}
</h3>

<p className="user-info mt-3">
  <strong>Name:</strong> {admin?.adminname}
</p>
          <button
            className="dashboard-btn mt-4"
            onClick={() => navigate("/products")}
          >
            View Products
          </button>

        </div>
      </div>
    </>
  );
}

export default Dashboard;