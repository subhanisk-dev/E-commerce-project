import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const adminStorage = localStorage.getItem("admin");
      const userStorage = localStorage.getItem("user");

      let adminData = null;
      let userData = null;

      if (adminStorage && adminStorage !== "undefined") {
        try {
          adminData = JSON.parse(adminStorage);
        } catch (error) {
          console.error("Invalid admin data in localStorage:", adminStorage);
          localStorage.removeItem("admin");
        }
      }

      if (userStorage && userStorage !== "undefined") {
        try {
          userData = JSON.parse(userStorage);
        } catch (error) {
          console.error("Invalid user data in localStorage:", userStorage);
          localStorage.removeItem("user");
        }
      }

      setAdmin(adminData);
      setUser(userData);

    } catch (error) {
      console.error("Navbar localStorage error:", error);

      localStorage.removeItem("admin");
      localStorage.removeItem("user");

      setAdmin(null);
      setUser(null);
    }
  }, [location]);


  async function logout() {
    try {
      if (admin) {
        await fetch(
          "http://localhost:5000/api/admin/logout",
          {
            method: "GET",
            credentials: "include"
          }
        );

        localStorage.removeItem("admin");
      }

      if (user) {
        await fetch(
          "http://localhost:5000/api/user/logout",
          {
            method: "GET",
            credentials: "include"
          }
        );

        localStorage.removeItem("user");
      }

      setAdmin(null);
      setUser(null);

      navigate("/login");

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">

        {/* LOGO */}
        <Link className="navbar-brand logo-text" to="/">
          ShopEase
        </Link>

        {/* MOBILE BUTTON */}
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon">
            <i className="fa-solid fa-bars mt-1"></i>
          </span>
        </button>

        {/* NAVBAR LINKS */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mb-2 mb-lg-0">

            <li className="nav-item">
              <Link className="nav-link custom-link" to="/">
                Home
              </Link>
            </li>

            {/* GUEST NAVBAR */}
            {!admin && !user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link custom-link" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link custom-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}

            {/* ADMIN NAVBAR */}
            {admin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link custom-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link custom-link" to="/products">
                    Products
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <span
                    className="nav-link dropdown-toggle custom-link"
                    role="button"
                    data-bs-toggle="dropdown"
                    style={{ cursor: "pointer" }}
                  >
                    Admin
                  </span>

                  <ul className="dropdown-menu">
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/add-product"
                      >
                        Add Product
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="dropdown-item"
                        to="/admin-products"
                      >
                        Admin Products
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <button
                    className="logout-btn"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* USER NAVBAR */}
            {user && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link custom-link"
                    to="/user-dashboard"
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link custom-link"
                    to="/produce"
                  >
                    Products
                  </Link>
                </li>

                {/* CATEGORIES DROPDOWN */}
                <li className="nav-item dropdown">
                  <span
                    className="nav-link dropdown-toggle custom-link"
                    role="button"
                    data-bs-toggle="dropdown"
                    style={{ cursor: "pointer" }}
                  >
                    Categories
                  </span>
                  <ul className="dropdown-menu dropdown-menu-dark-custom">
                    <li>
                      <Link className="dropdown-item" to="/produce?category=home_appliences">
                        🏠 Home Appliances
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/produce?category=Grocery">
                        🛒 Grocery
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/produce?category=Fashion">
                        👗 Fashion
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/produce?category=Electronics">
                        📱 Electronics
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/produce?category=Sports">
                        ⚽ Sports
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/produce?category=Toys">
                        🧸 Toys
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link custom-link"
                    to="/cart"
                  >
                    Cart
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link custom-link"
                    to="/my-orders"
                  >
                    Orders
                  </Link>
                </li>

                <li className="nav-item">
                  <button
                    className="logout-btn"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;