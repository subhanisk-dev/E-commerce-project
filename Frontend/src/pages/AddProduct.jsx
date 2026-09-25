import React, { useState } from "react";
import axios from "axios";

function AddProduct() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [formData, setFormData] = useState({
    title: "",
    Description: "",
    About_item: "",
    quantity: "",
    price: "",
    category: ""
  });

  const [file, setFile] = useState(null);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

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
      const data = new FormData();

      data.append("title", formData.title);
      data.append("Description", formData.Description);
      data.append("About_item", formData.About_item);
      data.append("quantity", formData.quantity);
      data.append("price", formData.price);
      data.append("category", formData.category);

      if (!file) {
        showBootstrapToast("Please select an image", "warning");
        return;
      }

      data.append("file", file);

      const res = await axios.post(
        "http://localhost:5000/api/admin/add-item",
        data,
        {
          withCredentials: true
        }
      );

      console.log("Add Product Response:", res.data);

      showBootstrapToast(
        res.data.message || "Product Added Successfully",
        "success"
      );

      setFormData({
        title: "",
        Description: "",
        About_item: "",
        quantity: "",
        price: "",
        category: ""
      });

      setFile(null);

      const fileInput = document.getElementById("product-image");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.log("ADD PRODUCT STATUS:", error.response?.status);
      console.log("ADD PRODUCT DATA:", error.response?.data);
      console.log("ADD PRODUCT ERROR:", error.message);

      showBootstrapToast(
        error.response?.data?.message || "Add Product Failed",
        "danger"
      );
    }
  }

  return (
    <>
      <style>{`
        .add-page{
          min-height:100vh;
          background:#f1f5f9;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:40px 20px;
        }

        .add-card{
          width:100%;
          max-width:750px;
          background:white;
          padding:40px;
          border-radius:20px;
          box-shadow:0 8px 20px rgba(0,0,0,0.1);
        }

        .add-title{
          text-align:center;
          font-size:38px;
          font-weight:bold;
          color:#0f172a;
          margin-bottom:35px;
        }

        .form-label{
          font-weight:600;
          color:#334155;
        }

        .form-control{
          border-radius:10px;
          padding:12px;
        }

        .submit-btn{
          width:100%;
          background:#0f172a;
          color:white;
          border:none;
          padding:14px;
          border-radius:10px;
          font-size:18px;
          font-weight:600;
          transition:0.3s;
        }

        .submit-btn:hover{
          background:#38bdf8;
        }

        .custom-toast{
          position:fixed;
          top:20px;
          right:20px;
          z-index:9999;
          min-width:320px;
          border-radius:12px;
        }

        @media(max-width:768px){
          .add-card{
            padding:25px;
          }

          .add-title{
            font-size:30px;
          }

          .custom-toast{
            right:10px;
            left:10px;
            min-width:auto;
          }
        }
      `}</style>

      {showToast && (
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
      )}

      <div className="add-page">
        <div className="add-card">
          <h1 className="add-title">
            Add Product
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Product Title
              </label>

              <input
                type="text"
                className="form-control"
                name="title"
                placeholder="Enter product title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-control"
                rows="3"
                name="Description"
                placeholder="Enter product description"
                value={formData.Description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">
                About Product
              </label>

              <textarea
                className="form-control"
                rows="3"
                name="About_item"
                placeholder="Enter about product"
                value={formData.About_item}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Quantity
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Price
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="price"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Category
              </label>

              <select
                className="form-control"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Category
                </option>

                <option value="home_appliences">
                  🏠 Home Appliances
                </option>

                <option value="Grocery">
                  🛒 Grocery
                </option>

                <option value="Fashion">
                  👗 Fashion
                </option>

                <option value="Electronics">
                  📱 Electronics
                </option>

                <option value="Sports">
                  ⚽ Sports
                </option>

                <option value="Toys">
                  🧸 Toys
                </option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">
                Upload Product Image
              </label>

              <input
                id="product-image"
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) =>
                  setFile(e.target.files[0] || null)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
            >
              Add Product
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddProduct;