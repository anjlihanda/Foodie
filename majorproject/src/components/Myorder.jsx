
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const previousOrdersRef = useRef([]);

  const fetchOrders = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const token = localStorage.getItem("foodieToken");

      if (!token) {
        setError("Please login to view your orders.");
        setLoading(false);
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
        setError(data.message || "Unable to load orders.");
        return;
      }

      const orderList = Array.isArray(data)
        ? data
        : data.orders || [];

      const oldOrders = previousOrdersRef.current;

      const delivered = orderList.some((newOrder) => {
        const oldOrder = oldOrders.find(
          (item) => item._id === newOrder._id
        );

        return (
          oldOrder &&
          oldOrder.status !== "Delivered" &&
          newOrder.status === "Delivered"
        );
      });

      if (delivered) {
        setNotification(
          "Your order has been successfully delivered!"
        );
      }

      previousOrdersRef.current = orderList;
      setOrders(orderList);
      setError("");
    } catch (err) {
      console.log("Fetch Orders Error:", err);

      if (showLoader) {
        setError("Server naal connection nahi ho reha.");
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    const interval = setInterval(
      () => fetchOrders(false),
      5000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(
      () => setNotification(""),
      5000
    );

    return () => clearTimeout(timer);
  }, [notification]);

  const trackingSteps = [
    "Placed",
    "Accepted",
    "Preparing",
    "Out for Delivery",
    "Delivered",
  ];

  const getCurrentStep = (status) => {
    const index = trackingSteps.findIndex(
      (step) =>
        step.toLowerCase() ===
        (status || "Placed").toLowerCase()
    );

    return index === -1 ? 0 : index;
  };

  const getTotal = (order) => {
    if (order.totalAmount !== undefined) {
      return order.totalAmount;
    }

    return (order.items || []).reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  };

  const getStatusColor = (status) => {
    switch ((status || "Placed").toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "preparing":
        return "bg-orange-100 text-orange-700";

      case "out for delivery":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const currentOrders = orders.filter(
    (order) =>
      !["delivered", "rejected", "cancelled"].includes(
        (order.status || "Placed").toLowerCase()
      )
  );

  return (
    <section className="min-h-screen bg-[#FAF8F2] py-8 px-4 pt-28">

      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-green-600 text-white px-5 py-4 rounded-xl shadow-lg text-center font-semibold">
          ✓ {notification}
        </div>
      )}

      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">

          <div>
            <h1 className="text-2xl font-bold text-[#2D3028]">
              My Orders
            </h1>

            <p className="text-sm text-[#77766F] mt-1">
              Track your current food orders.
            </p>

            <p className="text-xs text-green-600 mt-1">
              ● Order status updates automatically
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => fetchOrders(true)}
              className="border border-[#E3432E] text-[#E3432E] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E3432E] hover:text-white transition"
            >
              Refresh
            </button>

            <Link
              to="/profile"
              className="border border-[#E3432E] text-[#E3432E] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#E3432E] hover:text-white transition"
            >
              Back to Profile
            </Link>

          </div>
        </div>

        {loading ? (

          <div className="bg-white rounded-2xl border border-[#EAE5DA] p-8 text-center text-[#77766F]">
            Loading orders...
          </div>

        ) : error ? (

          <div className="bg-white rounded-2xl border border-[#EAE5DA] p-6 text-center">

            <p className="text-red-600 font-semibold">
              {error}
            </p>

            <button
              onClick={() => fetchOrders(true)}
              className="mt-4 bg-[#E3432E] text-white px-5 py-2 rounded-xl font-semibold"
            >
              Try Again
            </button>

          </div>

        ) : (

          <>

            {currentOrders.length === 0 ? (

              <div className="bg-white rounded-2xl border border-[#EAE5DA] p-6 text-center">

                <h2 className="text-xl font-bold text-[#2D3028]">
                  No Current Orders
                </h2>

                <p className="text-[#77766F] mt-2">
                  You don't have any active orders right now.
                </p>

                <Link
                  to="/#menu"
                  className="inline-block mt-4 bg-[#E3432E] text-white px-5 py-2 rounded-xl font-semibold"
                >
                  Explore Menu
                </Link>

              </div>

            ) : (

              <div className="space-y-4">

                {currentOrders.map((order, index) => {

                  const status = order.status || "Placed";

                  const currentStep = getCurrentStep(status);

                  const address = (
                    order.deliveryAddress || ""
                  ).trim();

                  // Restaurant Admin saved GPS location
                  const restaurant =
                    order.restaurantLocation || {};

                  const hasRestaurantGPS =
                    restaurant.latitude != null &&
                    restaurant.longitude != null &&
                    Number.isFinite(
                      Number(restaurant.latitude)
                    ) &&
                    Number.isFinite(
                      Number(restaurant.longitude)
                    ) &&
                    Number(restaurant.latitude) >= -90 &&
                    Number(restaurant.latitude) <= 90 &&
                    Number(restaurant.longitude) >= -180 &&
                    Number(restaurant.longitude) <= 180;

                  // Customer manual address is destination
                  const showRoute =
                    hasRestaurantGPS &&
                    address.length > 0 &&
                    [
                      "accepted",
                      "preparing",
                      "out for delivery",
                    ].includes(status.toLowerCase());

                  const restaurantCoords = showRoute
                    ? `${restaurant.latitude},${restaurant.longitude}`
                    : "";

                  // Embedded Google Maps route
                  const mapUrl = showRoute
                    ? `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(
                        restaurantCoords
                      )}&daddr=${encodeURIComponent(address)}`
                    : address
                    ? `https://www.google.com/maps?q=${encodeURIComponent(
                        address
                      )}&output=embed`
                    : "";

                  // Google Maps directions link
                  const directionsUrl = showRoute
                    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                        restaurantCoords
                      )}&destination=${encodeURIComponent(
                        address
                      )}&travelmode=driving`
                    : address
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        address
                      )}`
                    : "";

                  return (

                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-[#EAE5DA] p-4 shadow-sm"
                    >

                      <div className="flex justify-between items-start gap-3">

                        <div>

                          <h2 className="text-lg font-bold text-[#2D3028]">
                            Current Order #{index + 1}
                          </h2>

                          <p className="text-xs text-[#77766F] mt-1 break-all">
                            Order ID: {order._id}
                          </p>

                          <p className="text-xs text-[#77766F] mt-1">
                            {order.createdAt
                              ? new Date(
                                  order.createdAt
                                ).toLocaleString()
                              : "Date unavailable"}
                          </p>

                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </div>

                      {/* ORDER TRACKING */}

                      <div className="mt-3 mb-3 bg-[#FAF8F2] rounded-xl p-3">

                        <h3 className="font-bold text-sm text-[#2D3028] mb-3">
                          Order Tracking
                        </h3>

                        <div className="space-y-2">

                          {trackingSteps.map((step, i) => {

                            const completed =
                              i <= currentStep;

                            const current =
                              i === currentStep;

                            return (

                              <div
                                key={step}
                                className="flex items-center gap-3"
                              >

                                <div
                                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                    completed
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {completed ? "✓" : i + 1}
                                </div>

                                <div className="flex-1">

                                  <p
                                    className={`text-sm ${
                                      current
                                        ? "font-bold text-[#E3432E]"
                                        : completed
                                        ? "font-semibold text-green-700"
                                        : "text-[#77766F]"
                                    }`}
                                  >
                                    {step}
                                  </p>

                                  {current && (
                                    <p className="text-xs text-[#77766F]">
                                      Current Order Status
                                    </p>
                                  )}

                                </div>

                                {current && (
                                  <span className="text-xs font-semibold text-[#E3432E]">
                                    Current
                                  </span>
                                )}

                              </div>

                            );
                          })}

                        </div>
                      </div>

                      {/* GOOGLE MAP */}

                      {mapUrl && (

                        <div className="mt-3 mb-3">

                          <div className="flex justify-between items-center mb-2">

                            <h3 className="font-bold text-sm text-[#2D3028]">
                              {showRoute
                                ? "Restaurant to Your Location"
                                : "Delivery Location"}
                            </h3>

                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-[#E3432E]"
                            >
                              Open Map
                            </a>

                          </div>

                          <iframe
                            title={`Map for order ${order._id}`}
                            src={mapUrl}
                            width="100%"
                            height="220"
                            className="rounded-xl border border-[#EAE5DA]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                          />

                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#77766F]">

                            {showRoute ? (

                              <>
                                <span>
                                  📍 Restaurant:{" "}
                                  {restaurant.restaurantName || "Foodie"}
                                </span>

                                <span>
                                  📍 Customer: {address}
                                </span>

                                <span className="text-green-700 font-semibold">
                                  Restaurant-to-Customer Route
                                </span>
                              </>

                            ) : (

                              <span>
                                Restaurant-to-customer route will appear after
                                acceptance when restaurant GPS is available.
                              </span>

                            )}

                          </div>

                        </div>

                      )}

                      <hr className="my-3 border-[#EAE5DA]" />

                      {/* ORDERED ITEMS */}

                      <h3 className="font-bold text-sm text-[#2D3028] mb-2">
                        Ordered Items
                      </h3>

                      <div className="space-y-2">

                        {(order.items || []).map((item, i) => (

                          <div
                            key={item._id || i}
                            className="flex justify-between items-center gap-3 text-sm text-[#2D3028]"
                          >

                            <span>
                              {item.foodName} × {item.quantity}
                            </span>

                            <span className="font-semibold">
                              ₹
                              {Number(item.price || 0) *
                                Number(item.quantity || 0)}
                            </span>

                          </div>

                        ))}

                      </div>

                      <hr className="my-3 border-[#EAE5DA]" />

                      {/* DELIVERY ADDRESS AND TOTAL */}

                      <div className="grid sm:grid-cols-2 gap-3">

                        <div>

                          <p className="text-xs text-[#77766F]">
                            Delivery Address
                          </p>

                          <p className="font-semibold text-sm text-[#2D3028] mt-1">
                            {address || "No address available"}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs text-[#77766F]">
                            Total Amount
                          </p>

                          <p className="text-xl font-bold text-[#E3432E] mt-1">
                            ₹{getTotal(order)}
                          </p>

                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

            <Link
              to="/previous-orders"
              className="block mt-5 w-full text-center bg-[#E3432E] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#c93624] transition"
            >
              View Previous Orders
            </Link>

          </>

        )}

      </div>

    </section>
  );
}

export default MyOrders;
