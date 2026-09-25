import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  function showBootstrapToast(message, type = "success") {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  async function getProduct() {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/item/${id}`,
        {
          withCredentials: true
        }
      );

      const p = res.data.product;

      setFormData({
        title: p.itemname,
        Description: p.item_desc,
        About_item: p.item_about,
        quantity: p.quantity,
        price: p.price,
        category: p.category
      });

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      showBootstrapToast(
        "Failed to load product",
        "danger"
      );
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      if (file) {
        data.append("file", file);
      }

      const res = await axios.put(
        `http://localhost:5000/api/admin/update-item/${id}`,
        data,
        {
          withCredentials: true
        }
      );

      showBootstrapToast(
        res.data.message || "Product Updated Successfully",
        "success"
      );

      setTimeout(() => {
        navigate("/admin-products");
      }, 1500);

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );

      showBootstrapToast(
        error.response?.data?.message || "Update Failed",
        "danger"
      );
    }
  }

  return (
    <>
      <style>{`
        .edit-page{
          min-height:100vh;
          background:#f1f5f9;
          padding:50px 20px;
          display:flex;
          justify-content:center;
          align-items:center;
        }

        .edit-card{
          background:white;
          width:100%;
          max-width:750px;
          border-radius:20px;
          padding:40px;
          box-shadow:0 8px 20px rgba(0,0,0,0.1);
        }

        .edit-title{
          text-align:center;
          font-size:38px;
          font-weight:bold;
          color:#0f172a;
          margin-bottom:35px;
        }

        .form-label{
          color:#334155;
          font-weight:600;
        }

        .form-control{
          padding:12px;
          border-radius:10px;
        }

        .update-btn{
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

        .update-btn:hover{
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
          .edit-card{
            padding:25px;
          }

          .edit-title{
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

      <div className="edit-page">
        <div className="edit-card">

          <h1 className="edit-title">
            Edit Product
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
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter product title"
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
                value={formData.Description}
                onChange={handleChange}
                placeholder="Enter product description"
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
                value={formData.About_item}
                onChange={handleChange}
                placeholder="Enter about product"
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
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
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
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
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
                Upload New Image
              </label>

              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) =>
                  setFile(e.target.files[0] || null)
                }
              />
            </div>

            <button
              type="submit"
              className="update-btn"
            >
              Update Product
            </button>

          </form>

        </div>
      </div>
    </>
  );
}

export default EditProduct;