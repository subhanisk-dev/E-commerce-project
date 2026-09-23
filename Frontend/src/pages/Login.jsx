import React, { useState } from "react";

import axios from "axios";

import { useNavigate, Link, useLocation } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";



function Login() {

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // TOAST STATES
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const location = useLocation();

  const [role, setRole] = useState(
    location.state?.role || "user"
  );

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  // SHOW TOAST FUNCTION
  function showBootstrapToast(message, type = "success") {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      // FIXED: Changed 127.0.0.1 to localhost so the login
      // session cookie matches the backend used by Add To Cart.
      const url =
        role === "admin"
          ? "http://localhost:5000/api/admin/login"
          : "http://localhost:5000/api/user/login";

      // FIXED: Same payload structure for both user and admin.
      const payload = {
        email: formData.email,
        password: formData.password
      };

      console.log("Role:", role);
      console.log("Payload:", payload);
      console.log("URL:", url);

      const res = await axios.post(
        url,
        payload,
        {
          // FIXED: Required so Flask session cookie is stored.
          withCredentials: true
        }
      );

      console.log("Login Response:", res.data);

      // FIXED: Admin data is only accessed when admin login is selected.
      if (role === "admin") {

        const adminData = res.data.admin;

        if (!adminData) {
          throw new Error(
            "Admin login successful but admin data was not returned"
          );
        }

        localStorage.setItem(
          "admin",
          JSON.stringify(adminData)
        );

        console.log(
          "Stored Admin:",
          JSON.parse(localStorage.getItem("admin"))
        );

        showBootstrapToast(
          res.data.message || "Login Successful",
          "success"
        );

        // FIXED: Only one admin navigation.
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);

        return;
      }

      // ADDED: Store user data only for user login.
      const userData = res.data.user;

      if (!userData) {
        throw new Error(
          "User login successful but user data was not returned"
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      console.log(
        "Stored User:",
        JSON.parse(localStorage.getItem("user"))
      );

      showBootstrapToast(
        res.data.message || "Login Successful",
        "success"
      );

      // FIXED: Navigate user after successful login.
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1500);

    } catch (error) {

      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
      console.log("FULL:", error.response);

      showBootstrapToast(
        error.response?.data?.message ||
        error.message ||
        "Login Failed",
        "danger"
      );
    }
  }

  return (
    <>

      {/* BOOTSTRAP 5 */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      {/* CUSTOM STYLE */}
      <style>{`

        .login-page{
          min-height: 100vh;
          background: #f1f5f9;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        .login-card{
          width: 100%;
          max-width: 500px;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .login-title{
          text-align: center;
          font-size: 38px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 35px;
        }

        .form-label{
          font-weight: 600;
          color: #334155;
        }

        .form-control{
          border-radius: 10px;
          padding: 12px;
        }

        .login-btn{
          width: 100%;
          background: #0f172a;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          transition: 0.3s;
        }

        .login-btn:hover{
          background: #38bdf8;
        }

        .register-link{
          text-align: center;
          margin-top: 20px;
          color: #64748b;
        }

        .register-link a{
          color: #38bdf8;
          text-decoration: none;
          font-weight: 600;
        }

        .custom-toast{
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 320px;
          border-radius: 12px;
        }

        @media(max-width:768px){

          .login-card{
            padding: 25px;
          }

          .login-title{
            font-size: 30px;
          }

          .custom-toast{
            right: 10px;
            left: 10px;
            min-width: auto;
          }

        }

      `}</style>

      {/* TOAST */}

      {
        showToast && (

          <div
            className={`toast show align-items-center text-white bg-${toastType} border-0 custom-toast`}
            role="alert"
          >

            <div className="d-flex">

              <div className="toast-body">
                {toastMessage}
              </div>

              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToast(false)}
              ></button>

            </div>

          </div>

        )
      }

      <div className="login-page">

        <div className="login-card">

          <h1 className="login-title">

            {role === "admin"
              ? "Admin Login"
              : "User Login"}

          </h1>

          <div className="mb-4">

            <label className="form-label d-block">
              Login As
            </label>

            <div className="form-check form-check-inline">

              <input
                className="form-check-input"
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={(e) => setRole(e.target.value)}
              />

              <label className="form-check-label">
                User
              </label>

            </div>

            <div className="form-check form-check-inline">

              <input
                className="form-check-input"
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={(e) => setRole(e.target.value)}
              />

              <label className="form-check-label">
                Admin
              </label>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="mb-3">

              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
              />

            </div>

            <div className="mb-4">

              <label className="form-label">
                Password
              </label>

              <div className="input-group">

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <span
                  className="input-group-text bg-primary text-white"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >

                  {showPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                  }

                </span>

              </div>

            </div>

            <button
              type="submit"
              className="login-btn"
            >
              Login
            </button>

          </form>

          <div className="register-link">

            Don’t have an account?{" "}

            <Link to="/register">
              Register
            </Link>

          </div>

        </div>

      </div>

    </>
  );
}

export default Login;