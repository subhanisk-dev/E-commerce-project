import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AdminProducts() {

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function getProducts() {
    try {

      const res = await axios.get(
        "http://localhost:5000/api/admin/items",
        {
          withCredentials: true
        }
      );

      console.log("Admin Products Response:", res.data);

      if (res.data.status === "success") {
        setProducts(res.data.products || []);
        setMessage("");
      } else {
        setProducts([]);
        setMessage(
          res.data.message || "No products found. Please add a product."
        );
      }

    } catch (error) {

      console.log(
        error.response?.data || error.message
      );

      if (error.response?.status === 404) {
        setProducts([]);
        setMessage(
          error.response?.data?.message ||
          "Pls Add item to view"
        );
        return;
      }

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setProducts([]);
      setMessage(
        error.response?.data?.message ||
        "Something went wrong while fetching products."
      );
    }
  }

  async function deleteProduct(id) {
    try {

      const res = await axios.delete(
        `http://localhost:5000/api/admin/delete-item/${id}`,
        {
          withCredentials: true
        }
      );

      alert(res.data.message);

      getProducts();

    } catch (error) {
      console.log(
        error.response?.data || error.message
      );
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      
      <style>{`
        .products-page{
          min-height: 100vh;
          background: #f1f5f9;
          padding: 40px 20px;
        }

        .page-title{
          text-align: center;
          font-size: 42px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 40px;
        }

        .product-card{
          background: white;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
          transition: 0.3s;
          height: 100%;
        }

        .product-card:hover{
          transform: translateY(-8px);
        }

        .product-img{
          width: 100%;
          height: 250px;
          object-fit: cover;
        }

        .product-body{
          padding: 20px;
        }

        .product-title{
          font-size: 24px;
          font-weight: bold;
          color: #0f172a;
        }

        .product-desc{
          color: #64748b;
          margin: 15px 0;
        }

        .product-price{
          color: #38bdf8;
          font-size: 24px;
          font-weight: bold;
        }

        .btn-custom{
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          color: white;
          text-decoration: none;
          transition: 0.3s;
          font-weight: 500;
        }

        .view-btn{
          background: #0ea5e9;
        }

        .edit-btn{
          background: #22c55e;
        }

        .delete-btn{
          background: #ef4444;
        }

        .btn-custom:hover{
          opacity: 0.9;
          color: white;
        }

        .empty-products{
          max-width: 600px;
          margin: 80px auto;
          background: white;
          border-radius: 18px;
          padding: 50px 30px;
          text-align: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
        }

        .empty-products h2{
          font-size: 30px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .empty-products p{
          color: #64748b;
          margin-bottom: 25px;
        }

        .add-product-btn{
          display: inline-block;
          background: #0ea5e9;
          color: white;
          padding: 12px 22px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: 0.3s;
        }

        .add-product-btn:hover{
          background: #0284c7;
          color: white;
        }

        @media(max-width:768px){
          .page-title{
            font-size: 32px;
          }

          .product-img{
            height: 220px;
          }
        }
      `}</style>

      <div className="products-page">

        <h1 className="page-title">
          Admin Products
        </h1>

        {products.length === 0 ? (

          <div className="empty-products">

            <h2>
              No Products Found
            </h2>

            <p>
              You haven't added any products yet.
              <br />
              Add your first product to see it here.
            </p>

            <Link
              to="/add-product"
              className="add-product-btn"
            >
              + Add Product
            </Link>

          </div>

        ) : (

          <div className="container">
            <div className="row g-4">

              {products.map((item) => (

                <div
                  className="col-12 col-sm-6 col-lg-4"
                  key={item.itemid}
                >

                  <div className="product-card">

                    <img
                      src={item.image}
                      alt={item.itemname}
                      className="product-img"
                    />

                    <div className="product-body">

                      <h2 className="product-title">
                        {item.itemname}
                      </h2>

                      <p className="product-desc">
                        {item.item_desc}
                      </p>

                      <h3 className="product-price">
                        ₹{item.price}
                      </h3>

                      <div className="d-flex gap-2 mt-4 flex-wrap">

                        <Link
                          to={`/single/${item.itemid}`}
                          className="btn-custom view-btn"
                        >
                          View
                        </Link>

                        <Link
                          to={`/edit/${item.itemid}`}
                          className="btn-custom edit-btn"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn-custom delete-btn"
                          onClick={() => deleteProduct(item.itemid)}
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  </div>

                </div>

              ))}

            </div>
          </div>

        )}

      </div>
    </>
  );
}

export default AdminProducts;