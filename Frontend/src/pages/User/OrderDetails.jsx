import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function OrderDetails() {
  const { orderid } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrder();
  }, []);

  async function fetchOrder() {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/orders/${orderid}`,
        {
          withCredentials: true
        }
      );

      setOrder(res.data.order);
      setItems(res.data.items);
    } catch (error) {
      console.log(error);
    }
  }

  return (
  <div className="container py-4">

    <style>{`
      .order-card{
        border:none;
        border-radius:15px;
        box-shadow:0 4px 12px rgba(0,0,0,0.08);
      }

      .product-card{
        border:none;
        border-radius:15px;
        overflow:hidden;
        box-shadow:0 4px 12px rgba(0,0,0,0.08);
        transition:0.3s;
        height:100%;
      }

      .product-card:hover{
        transform:translateY(-5px);
      }

      .product-img{
        width:100%;
        height:220px;
        object-fit:cover;
      }

      .product-title{
        font-size:16px;
        font-weight:600;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      @media(max-width:768px){
        .product-img{
          height:180px;
        }

        .product-title{
          font-size:14px;
        }
      }
    `}</style>

    <h2 className="fw-bold mb-4">
      Order Details
    </h2>

    {order && (
      <div className="card order-card p-4 mb-4">

        <h5 className="mb-3">
          Order ID: {order.orderid}
        </h5>

        <div className="row">

          <div className="col-md-6 mb-2">
            <strong>Total:</strong> ₹{order.grand_total}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Status:</strong>{" "}
            <span className="badge bg-success">
              Paid
            </span>
          </div>

        </div>

      </div>
    )}

    <h4 className="mb-3">
      Ordered Items
    </h4>

    <div className="row">

      {items.map((item, index) => (
        <div
          className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
          key={index}
        >
          <div className="card product-card">

            <img
              src={
                item?.item_image ||
                item?.item?._image ||
                "https://via.placeholder.com/300"
              }
              alt={item?.item_name || "Product"}
              className="product-img"
            />

            <div className="card-body">

              <h6
                className="product-title"
                title={item?.item_name}
              >
                {item?.item_name}
              </h6>

              <p className="mb-1">
                <strong>Qty:</strong>{" "}
                {item?.item_quantity}
              </p>

              <p className="mb-0">
                <strong>Price:</strong> ₹
                {item?.item_price ||
                  item?.subtotal ||
                  "N/A"}
              </p>

            </div>

          </div>
        </div>
      ))}

    </div>

  </div>
);
}

export default OrderDetails;