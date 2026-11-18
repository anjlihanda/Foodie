
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "https://foodie-1-ck6c.onrender.com/api";

function PreviousOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingData, setRatingData] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [ratingMessages, setRatingMessages] = useState({});

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("foodieToken");

      if (!token) {
        setError("Please login to view your orders.");
        return;
      }

      const res = await fetch(`${API}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load previous orders.");
        return;
      }

      const orderList = Array.isArray(data) ? data : data.orders || [];

      const previous = orderList.filter((order) =>
        ["delivered", "rejected", "cancelled"].includes(
          (order.status || "").toLowerCase()
        )
      );

      setOrders(previous);
      setError("");
    } catch (err) {
      console.log("Previous Orders Error:", err);
      setError("Server naal connection nahi ho reha.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateRating = (key, field, value) => {
    setRatingData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const submitReview = async (order, item) => {
    const token = localStorage.getItem("foodieToken");
    const foodId = item.foodId?._id || item.foodId;

    if (!token) {
      setRatingMessages((prev) => ({
        ...prev,
        [order._id]: "Please login first.",
      }));
      return;
    }

    if (!foodId) {
      setRatingMessages((prev) => ({
        ...prev,
        [`${order._id}_${item._id}`]:
          "Food ID unavailable. Rating cannot be submitted.",
      }));
      return;
    }

    const key = `${order._id}_${foodId}`;
    const selected = ratingData[key] || {};

    if (!selected.stars) {
      setRatingMessages((prev) => ({
        ...prev,
        [key]: "Please select stars first.",
      }));
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [key]: true }));
      setRatingMessages((prev) => ({ ...prev, [key]: "" }));

      const res = await fetch(`${API}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          food: foodId,
          order: order._id,
          stars: selected.stars,
          comment: selected.comment || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRatingMessages((prev) => ({
          ...prev,
          [key]: data.message || "Review submit nahi hoya.",
        }));
        return;
      }

      setRatingMessages((prev) => ({
        ...prev,
        [key]: "Review submitted successfully!",
      }));

      setRatingData((prev) => ({
        ...prev,
        [key]: { ...prev[key], submitted: true },
      }));
    } catch (err) {
      console.log("Rating Error:", err);
      setRatingMessages((prev) => ({
        ...prev,
        [key]: "Server naal connection nahi ho reha.",
      }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getTotal = (order) => {
    if (order.totalAmount !== undefined) return order.totalAmount;

    return (order.items || []).reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF8F2] py-8 px-4 pt-28">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center gap-3 flex-wrap mb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3028]">
              Previous Orders
            </h1>
            <p className="text-sm text-[#77766F] mt-1">
              Your completed and past orders.
            </p>
          </div>

          <Link
            to="/my-orders"
            className="border border-[#E3432E] text-[#E3432E] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E3432E] hover:text-white transition"
          >
            Back to My Orders
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-6 text-center text-[#77766F]">
            Loading previous orders...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchOrders();
              }}
              className="mt-3 bg-[#E3432E] text-white px-5 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EAE5DA] p-6 text-center">
            <h2 className="font-bold text-lg text-[#2D3028]">
              No Previous Orders
            </h2>
            <p className="text-sm text-[#77766F] mt-2">
              Your delivered and cancelled orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => {
              const isDelivered =
                (order.status || "").toLowerCase() === "delivered";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-[#EAE5DA] p-3 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="font-bold text-[#2D3028]">
                        Order #{index + 1}
                      </h2>
                      <p className="text-xs text-[#77766F] mt-1 break-all">
                        Order ID: {order._id}
                      </p>
                      <p className="text-xs text-[#77766F] mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <hr className="my-3 border-[#EAE5DA]" />

                  <div className="space-y-2">
                    {(order.items || []).map((item, i) => {
                      const foodId = item.foodId?._id || item.foodId;
                      const key = `${order._id}_${foodId || i}`;
                      const selected = ratingData[key] || {};

                      return (
                        <div key={item._id || i}>
                          <div className="flex justify-between gap-2 text-sm text-[#2D3028]">
                            <span>
                              {item.foodName} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              ₹
                              {Number(item.price || 0) *
                                Number(item.quantity || 0)}
                            </span>
                          </div>

                          {isDelivered && (
                            <div className="mt-2 bg-[#FAF8F2] rounded-lg p-3">
                              <h4 className="text-sm font-bold text-[#2D3028]">
                                Rate {item.foodName}
                              </h4>

                              {selected.submitted ? (
                                <p className="text-sm text-green-700 font-semibold mt-2">
                                  Your review has been submitted.
                                </p>
                              ) : (
                                <>
                                  <div className="flex gap-2 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                          updateRating(key, "stars", star)
                                        }
                                        className={`text-2xl ${
                                          star <= (selected.stars || 0)
                                            ? "text-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>

                                  <textarea
                                    value={selected.comment || ""}
                                    onChange={(e) =>
                                      updateRating(
                                        key,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    maxLength={500}
                                    placeholder="Write your review (optional)"
                                    className="w-full mt-2 p-2 rounded-lg border border-[#EAE5DA] text-sm outline-none focus:border-[#E3432E]"
                                    rows="2"
                                  />

                                  <button
                                    type="button"
                                    disabled={submitting[key]}
                                    onClick={() => submitReview(order, item)}
                                    className="mt-2 bg-[#E3432E] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                                  >
                                    {submitting[key]
                                      ? "Submitting..."
                                      : "Submit Review"}
                                  </button>
                                </>
                              )}

                              {ratingMessages[key] && (
                                <p className="text-sm mt-2 font-semibold text-green-700">
                                  {ratingMessages[key]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <hr className="my-3 border-[#EAE5DA]" />

                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <p className="text-xs text-[#77766F]">
                        Delivery Address
                      </p>
                      <p className="text-sm font-semibold text-[#2D3028]">
                        {order.deliveryAddress || "Not available"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#77766F]">Total Amount</p>
                      <p className="text-lg font-bold text-[#E3432E]">
                        ₹{getTotal(order)}
                      </p>
                    </div>
                  </div>

                  {isDelivered && (
                    <div className="mt-3 bg-blue-50 text-blue-700 rounded-lg p-2 text-xs text-center font-semibold">
                      Order Successfully Delivered!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default PreviousOrders;
