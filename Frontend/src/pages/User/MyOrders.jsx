import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const res = await axios.get(
                "http://127.0.0.1:5000/api/myorders",
                {
                    withCredentials: true
                }
            );

            setOrders(res.data.orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mt-4">

            <h2>My Orders</h2>

            {loading ? (
                <p>Loading...</p>
            ) : orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="row">
                    {orders.map((order) => (
                        <div key={order.orderid} className="col-md-6 mb-3">

                            <div className="card p-3 shadow-sm">

                                <h5>Order ID: {order.orderid}</h5>

                                <p>
                                    Total: ₹
                                    {order?.grand_total ||
                                        order?.total ||
                                        order?.amount ||
                                        "N/A"}
                                </p>

                                <p>
                                    Status: {order?.status || "Completed"}
                                </p>

                              <div className="row">
                                <div className="col-3">
                                  <button
                                    className="btn btn-primary btn-sm mb-2"
                                    onClick={() =>
                                        navigate(`/order/${order.orderid}`)
                                    }
                                >
                                    View Details
                                </button>

                               

                                </div>
                                <div className="col-3">
                                     <a
                                    className="btn btn-success btn-sm"
                                    href={`http://127.0.0.1:5000/api/invoice/${order.orderid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Download Invoice
                                </a>
                                </div>
                              </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrders;