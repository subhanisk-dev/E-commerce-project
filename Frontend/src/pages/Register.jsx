import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Register() {
    const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    username: "",
    useremail: "",
    useraddress: "",
    userpassword: "",
    userphone: "",
    usergender: "",
    useragree: false
  });
  const url =
    role === "admin"
      ? "http://localhost:5000/api/admin/register"
      : "http://localhost:5000/api/user/register";

  const payload =
    role === "admin"
      ? {
        username: formData.username,
        useremail: formData.useremail,
        useraddress: formData.useraddress,
        userpassword: formData.userpassword,
        useragree: formData.useragree
      }
      : {
        username: formData.username,
        useremail: formData.useremail,
        useraddress: formData.useraddress,
        userpassword: formData.userpassword,
        userphone: formData.userphone,
        usergender: formData.usergender
      };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
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
    const url =
      role === "admin"
        ? "http://localhost:5000/api/adminregister"
        : "http://localhost:5000/api/user/register";

    const payload =
      role === "admin"
        ? {
            username: formData.username,
            useremail: formData.useremail,
            useraddress: formData.useraddress,
            userpassword: formData.userpassword,
            useragree: formData.useragree
          }
        : {
            username: formData.username,
            useremail: formData.useremail,
            useraddress: formData.useraddress,
            userpassword: formData.userpassword,
            userphone: formData.userphone,
            usergender: formData.usergender
          };

    const res = await axios.post(url, payload);

    console.log(res.data);

    showBootstrapToast(
      res.data.message || "OTP Sent Successfully",
      "success"
    );

    // navigate("/verify-otp", {
    //   state: {
    //     token: res.data.token,
    //     role: role
    //   }
    // });
  navigate("/verify-otp", {
  state: {
    email: formData.useremail,
    role: role
  }
});

  } catch (error) {
    console.log(error.response?.data || error.message);

    showBootstrapToast(
      error.response?.data?.message || "Register Failed",
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
        .register-page{
          min-height: 100vh;
          background: #f1f5f9;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        .register-card{
          width: 100%;
          max-width: 650px;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .register-title{
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

        .form-check-label{
          color: #475569;
        }

        .register-btn{
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

        .register-btn:hover{
          background: #38bdf8;
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

          .register-card{
            padding: 25px;
          }

          .register-title{
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

      <div className="register-page">

        <div className="register-card">

         
  <h1 className="register-title">
    Create Account
  </h1>

  {/* ROLE SELECTION */}

  <div className="mb-4">
    <label className="form-label d-block">
      Register As
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
                Username
              </label>

              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                className="form-control"
                name="useremail"
                placeholder="Enter email"
                value={formData.useremail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Address
              </label>

              <input
                type="text"
                className="form-control"
                name="useraddress"
                placeholder="Enter address"
                value={formData.useraddress}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Password
              </label>

             <div className="input-group">
      <input
        type={showPassword ? "text" : "password"}
        className="form-control"
        name="userpassword"
        placeholder="Enter password"
        value={formData.userpassword}
        onChange={handleChange}
        required
      />

      <span
        className="input-group-text bg-dark text-light"
        style={{ cursor: "pointer" }}
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
            </div>

            {/* USER ONLY FIELDS */}

            {role === "user" && (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    name="userphone"
                    placeholder="Enter phone number"
                    value={formData.userphone}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">
                    Gender
                  </label>

                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="usergender"
                      value="Male"
                      checked={formData.usergender === "Male"}
                      onChange={handleChange}
                    />

                    <label className="form-check-label">
                      Male
                    </label>
                  </div>

                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="usergender"
                      value="Female"
                      checked={formData.usergender === "Female"}
                      onChange={handleChange}
                    />

                    <label className="form-check-label">
                      Female
                    </label>
                  </div>

                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="usergender"
                      value="Other"
                      checked={formData.usergender === "Other"}
                      onChange={handleChange}
                    />

                    <label className="form-check-label">
                      Other
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* ADMIN ONLY FIELD */}

            {role === "admin" && (
              <div className="form-check mb-4">

                <input
                  className="form-check-input"
                  type="checkbox"
                  name="useragree"
                  checked={formData.useragree}
                  onChange={handleChange}
                  required
                />

                <label className="form-check-label">
                  I agree to the Terms & Conditions
                </label>

              </div>
            )}

            <button
              type="submit"
              className="register-btn"
            >
              Register as {role === "admin" ? "Admin" : "User"}
            </button>

          </form>

        </div>

      </div>
    </>
  );
}

export default Register;