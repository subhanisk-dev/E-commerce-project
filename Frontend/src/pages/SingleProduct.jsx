import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function SingleProduct() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);

  async function getSingleProduct() {
    try {

      const res = await axios.get(
        `http://127.0.0.1:5000/api/admin/item/${id}`,
        {
          withCredentials: true
        }
      );

      setProduct(res.data.product);
console.log(res.data.product)
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }

  useEffect(() => {
    getSingleProduct();
  }, []);

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>

      {/* CUSTOM STYLE */}
      <style>{`
        .single-product-page{
          min-height: 100vh;
          background: #f1f5f9;
          padding: 50px 20px;
        }

        .product-card{
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .product-image{
          width: 100%;
          height: 500px;
          object-fit: cover;
        }

        .product-details{
          padding: 40px;
        }

        .product-title{
          font-size: 42px;
          font-weight: bold;
          color: #0f172a;
        }

        .product-desc{
          color: #64748b;
          font-size: 18px;
          margin-top: 20px;
          line-height: 1.8;
        }

        .product-about{
          background: #e2e8f0;
          padding: 20px;
          border-radius: 12px;
          margin-top: 25px;
          color: #334155;
        }

        .product-price{
          color: #38bdf8;
          font-size: 36px;
          font-weight: bold;
          margin-top: 25px;
        }

        .product-info{
          margin-top: 20px;
          font-size: 18px;
          color: #475569;
        }

        .info-badge{
          background: #0f172a;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          display: inline-block;
          margin-right: 10px;
          margin-top: 10px;
        }

        @media(max-width:768px){

          .product-image{
            height: 320px;
          }

          .product-details{
            padding: 25px;
          }

          .product-title{
            font-size: 30px;
          }

          .product-price{
            font-size: 28px;
          }

          .product-desc{
            font-size: 16px;
          }
        }
      `}</style>

      <div className="single-product-page">

        <div className="container">
          <div className="row justify-content-center">

            <div className="col-lg-10">

              <div className="product-card">

                <div className="row g-0">

                  {/* IMAGE */}
                  <div className="col-md-6">
                    <img
                      src={product.image}
                      alt={product.itemname}
                      className="product-image"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="col-md-6">
                    <div className="product-details">

                      <h1 className="product-title">
                        {product.itemname}
                      </h1>

                      <p className="product-desc">
                        {product.item_desc}
                      </p>

                      <div className="product-about">
                        {product.item_about}
                      </div>

                      <h2 className="product-price">
                        ₹{product.price}
                      </h2>

                      <div className="product-info">

                        <span className="info-badge">
                          Quantity: {product.quantity}
                        </span>

                        <span className="info-badge">
                          {product.category}
                        </span>

                      </div>

                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </>
  );
}

export default SingleProduct;