import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../store/Slices/ProductSlice";

function Products() {

  const { items, loading, error } = useSelector(
    (state) => state.Products
  );

  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  // FILTER PRODUCTS
  const filteredProducts = useMemo(() => {

    return items.filter((s) =>
      s.category.toLowerCase().includes(
        search.toLowerCase()
      )
    );

  }, [items, search]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  if (error) {
    return <h2>{error}</h2>;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h2>Loading...</h2>
      </div>
    );
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
          margin-bottom: 35px;
        }

        .search-box{
          max-width: 450px;
          margin: auto;
          margin-bottom: 40px;
        }

        .search-input{
          border-radius: 12px;
          padding: 14px;
          border: 1px solid #cbd5e1;
        }

        .product-card{
          border: none;
          border-radius: 18px;
          overflow: hidden;
          background: white;
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
          transition: 0.3s;
          height: 100%;
        }

        .product-card:hover{
          transform: translateY(-8px);
        }

        .product-img{
          width: 100%;
          height: 240px;
          object-fit: cover;
        }

        .card-body{
          padding: 20px;
        }

        .category-text{
          color: #38bdf8;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 10px;
        }

        .product-name{
          font-size: 22px;
          font-weight: bold;
          color: #0f172a;
        }

        .product-price{
          color: #0ea5e9;
          font-size: 24px;
          font-weight: bold;
        }

        .quantity{
          color: #64748b;
        }

        @media(max-width:768px){

          .page-title{
            font-size: 32px;
          }

          .product-img{
            height: 200px;
          }
        }
      `}</style>

      <div className="products-page">

        <h1 className="page-title">
          Products
        </h1>

        {/* SEARCH */}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control search-input"
          />
        </div>

        {/* PRODUCTS */}

        <div className="container">
          <div className="row g-4">

            {filteredProducts.map((v) => (

              <div
                key={v.itemid}
                className="col-12 col-sm-6 col-lg-3"
              >
                <div className="card product-card">

                  <img
                    src={v.image}
                    alt={v.itemname}
                    className="product-img"
                  />

                  <div className="card-body text-center">

                    <p className="category-text">
                      {v.category}
                    </p>

                    <p className="product-names">
                      {v.itemname}
                    </p>

                    <h4 className="product-price">
                      ₹{v.price}
                    </h4>

                    <p className="quantity">
                      Quantity: {v.quantity}
                    </p>

                  </div>

                </div>
              </div>

            ))}

          </div>
        </div>

      </div>
    </>
  );
}

export default Products;