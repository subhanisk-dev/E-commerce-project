import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditProduct() {

  const { id } = useParams();
  const navigate = useNavigate();

  // TOAST STATES
  const [showToast, setShowToast] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const [toastType, setToastType] = useState("success");

  const [formData, setFormData] = useState({
    title: "",
    Description: "",
    About_item: "",
    quantity: "",
    price: "",
    category: "",
  });

  const [file, setFile] = useState(null);

  // SHOW TOAST FUNCTION

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
        `http://127.0.0.1:5000/api/admin/item/${id}`,
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
        category: p.category,
      });

    } catch (error) {

      console.log(error.response?.data || error.message);

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
      [e.target.name]: e.target.value,
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
        `http://127.0.0.1:5000/api/admin/update-item/${id}`,
        data,
        {
          withCredentials: true
        }
      );

      // SUCCESS TOAST
      showBootstrapToast(
        res.data.message || "Product Updated Successfully",
        "success"
      );

      setTimeout(() => {
        navigate("/admin-products");
      }, 1500);

    } catch (error) {

      console.log(error.response?.data || error.message);

      // ERROR TOAST
      showBootstrapToast(
        error.response?.data?.message || "Update Failed",
        "danger"
      );
    }
  }

  return (
    <>
      {/* CUSTOM STYLE */}
      <style>{`
        .edit-page{
          min-height: 100vh;
          background: #f1f5f9;
          padding: 50px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .edit-card{
          background: white;
          width: 100%;
          max-width: 750px;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .edit-title{
          text-align: center;
          font-size: 38px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 35px;
        }

        .form-label{
          color: #334155;
          font-weight: 600;
        }

        .form-control{
          padding: 12px;
          border-radius: 10px;
        }

        .update-btn{
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

        .update-btn:hover{
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

          .edit-card{
            padding: 25px;
          }

          .edit-title{
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
                />

              </div>

            </div>

            <div className="mb-3">

              <label className="form-label">
                Category
              </label>

              <input
                type="text"
                className="form-control"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
              />

            </div>

            <div className="mb-4">

              <label className="form-label">
                Upload New Image
              </label>

              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
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