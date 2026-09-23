import React from "react";
import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <>
      {/* Bootstrap 5.0.2 */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <style>{`
        .notfound-page{
          min-height:100vh;
          display:flex;
          justify-content:center;
          align-items:center;
          background:#f1f5f9;
          padding:20px;
        }

        .notfound-card{
          text-align:center;
          background:white;
          padding:50px 35px;
          border-radius:20px;
          box-shadow:0 8px 20px rgba(0,0,0,0.1);
          max-width:500px;
          width:100%;
        }

        .error-code{
          font-size:90px;
          font-weight:800;
          color:#0f172a;
          margin-bottom:10px;
        }

        .error-title{
          font-size:32px;
          font-weight:700;
          color:#334155;
          margin-bottom:15px;
        }

        .error-text{
          color:#64748b;
          font-size:18px;
          margin-bottom:30px;
        }

        .home-btn{
          background:#0f172a;
          color:white;
          padding:12px 28px;
          border-radius:10px;
          text-decoration:none;
          font-weight:600;
          transition:0.3s;
          display:inline-block;
        }

        .home-btn:hover{
          background:#38bdf8;
          color:white;
        }

        @media(max-width:768px){

          .error-code{
            font-size:70px;
          }

          .error-title{
            font-size:26px;
          }

          .error-text{
            font-size:16px;
          }
        }
      `}</style>

      <div className="notfound-page">

        <div className="notfound-card">

          <h1 className="error-code">
            404
          </h1>

          <h2 className="error-title">
            Page Not Found
          </h2>

          <p className="error-text">
            The page you are looking for does not exist or has been moved.
          </p>

          <Link to="/" className="home-btn">
            Back To Home
          </Link>

        </div>

      </div>
    </>
  );
}

export default PageNotFound;