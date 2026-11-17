
import React, { useEffect, useState } from "react";
import OfferManagement from "./OfferManagement";
import RestaurantLocation from "./RestaurantLocation";

function RestaurantAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState("");
  const [showAllOrders, setShowAllOrders] = useState(false);

  const token = localStorage.getItem("foodieToken");

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/orders/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } else {
        console.log("Orders Error:", data.message);
      }
    } catch (error) {
      console.log("Orders Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // HIDE NOTIFICATION
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  // UPDATE ORDER STATUS
  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `http://localhost:5000/api/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id
              ? {
                  ...order,
                  status: data.order?.status || status,
                }
              : order
          )
        );

        if (status === "Delivered") {
          setNotification(
            "Delivery Completed! Order has been successfully delivered to the customer."
          );
        } else {
          alert(`Order ${status} successfully!`);
        }
      } else {
        alert(data.message || "Status update failed");
      }
    } catch (error) {
      console.log("Status Update Error:", error);
      alert("Server error!");
    } finally {
      setUpdatingId(null);
    }
  };

  // STATUS COLORS
  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Delivered":
        return "bg-blue-100 text-blue-700";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-700";
      case "Preparing":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // PAYMENT DETAILS
  const getPaymentMethod = (order) => {
    return order.paymentMethod === "Online"
      ? "Online Payment"
      : "Cash on Delivery";
  };

  const getPaymentStatus = (order) => {
    if (order.paymentMethod === "Online") {
      return order.paymentStatus === "Paid"
        ? "Paid"
        : order.paymentStatus || "Pending";
    }

    return order.paymentStatus || "Pending";
  };

  // PAYMENT STATUS COLORS
  const getPaymentStyle = (order) => {
    const status = getPaymentStatus(order);

    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Failed") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // TOTAL AMOUNT
  const getTotalAmount = (order) => {
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
      return Number(order.totalAmount);
    }

    return (
      order.items?.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ) || 0
    );
  };

  // FILTER REJECTED ORDERS
  const activeOrders = orders.filter(
    (order) => order.status !== "Rejected"
  );

  // SORT NEWEST FIRST
  const sortedOrders = [...activeOrders].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  // ORDER COUNTS
  const totalOrders = activeOrders.length;

  const pendingOrders = activeOrders.filter(
    (order) => !order.status || order.status === "Placed"
  );

  const acceptedOrders = activeOrders.filter(
    (order) => order.status === "Accepted"
  );

  // SHOW LATEST 2 OR ALL
  const visibleOrders = showAllOrders
    ? sortedOrders
    : sortedOrders.slice(0, 2);

  // NEXT DELIVERY STATUS
  const getNextStatus = (status) => {
    switch (status) {
      case "Accepted":
        return {
          status: "Preparing",
          label: "Start Preparing",
          color: "bg-orange-500 hover:bg-orange-600",
        };

      case "Preparing":
        return {
          status: "Out for Delivery",
          label: "Out for Delivery",
          color: "bg-purple-600 hover:bg-purple-700",
        };

      case "Out for Delivery":
        return {
          status: "Delivered",
          label: "Mark as Delivered",
          color: "bg-blue-600 hover:bg-blue-700",
        };

      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF8F2] pt-28 pb-10 px-5">

      {/* DELIVERED NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-green-600 text-white px-5 py-4 rounded-xl shadow-lg text-center font-semibold z-50">
          ✓ {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADING */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2D3028]">
            Restaurant Orders
          </h1>

          <p className="text-[#77766F] mt-2">
            Manage customer orders and deliveries.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">

          <div className="bg-white rounded-xl p-4 border border-[#EAE5DA] shadow-sm">
            <p className="text-xs sm:text-sm text-[#77766F]">
              Total Orders
            </p>
            <h2 className="text-2xl font-bold text-[#2D3028] mt-1">
              {totalOrders}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#EAE5DA] shadow-sm">
            <p className="text-xs sm:text-sm text-[#77766F]">
              Accepted Orders
            </p>
            <h2 className="text-2xl font-bold text-green-600 mt-1">
              {acceptedOrders.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#EAE5DA] shadow-sm">
            <p className="text-xs sm:text-sm text-[#77766F]">
              Pending Orders
            </p>
            <h2 className="text-2xl font-bold text-yellow-600 mt-1">
              {pendingOrders.length}
            </h2>
          </div>
        </div>

        {/* ORDER HEADING */}
        <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-[#2D3028]">
              Recent Orders
            </h2>

            <p className="text-xs text-[#77766F] mt-1">
              Showing {visibleOrders.length} of {totalOrders} orders
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-[#E3432E] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#c93422]"
          >
            Refresh Orders
          </button>
        </div>

        {/* ORDER LIST */}
        {loading ? (
          <p className="text-center py-12 text-[#77766F]">
            Loading orders...
          </p>
        ) : visibleOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#EAE5DA]">
            <h2 className="text-xl font-bold text-[#2D3028]">
              No Active Orders
            </h2>

            <p className="text-sm text-[#77766F] mt-2">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

            {visibleOrders.map((order, index) => {
              const customer =
                order.customer &&
                typeof order.customer === "object"
                  ? order.customer
                  : {};

              const isPending =
                !order.status || order.status === "Placed";

              const nextStatus = getNextStatus(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-[#EAE5DA] p-3 shadow-sm"
                >

                  {/* ORDER HEADER */}
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[#2D3028]">
                        Order #{index + 1}
                      </h2>

                      <p className="text-[11px] text-[#77766F] mt-0.5">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "Date not available"}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status || "Placed"}
                    </span>
                  </div>

                  <hr className="my-2 border-[#EAE5DA]" />

                  {/* CUSTOMER DETAILS */}
                  <h3 className="font-bold text-xs text-[#2D3028] mb-1.5">
                    Customer Details
                  </h3>

                  <div className="space-y-1 text-[11px]">
                    <p className="text-[#77766F]">
                      Name:
                      <span className="font-semibold text-[#2D3028] ml-2">
                        {customer.name || "Not available"}
                      </span>
                    </p>

                    <p className="text-[#77766F]">
                      Phone:
                      <span className="font-semibold text-[#2D3028] ml-2">
                        {order.phone || "Not available"}
                      </span>
                    </p>

                    <p className="text-[#77766F]">
                      Email:
                      <span className="font-semibold text-[#2D3028] ml-2">
                        {customer.email || "Not available"}
                      </span>
                    </p>
                  </div>

                  {/* DELIVERY ADDRESS */}
                  <div className="mt-2 bg-[#FAF8F2] p-2 rounded-lg">
                    <h3 className="font-bold text-xs text-[#2D3028] mb-0.5">
                      Delivery Address
                    </h3>

                    <p className="text-[11px] text-[#77766F]">
                      {order.deliveryAddress || "Address not available"}
                    </p>
                  </div>

                  {/* ORDERED ITEMS */}
                  <div className="mt-2">
                    <h3 className="font-bold text-xs text-[#2D3028] mb-1.5">
                      Ordered Items
                    </h3>

                    <div className="space-y-1">
                      {order.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center gap-2 text-[11px]"
                        >
                          <span className="text-[#2D3028]">
                            {item.foodName} × {item.quantity}
                          </span>

                          <span className="font-semibold text-[#2D3028]">
                            ₹
                            {Number(item.price || 0) *
                              Number(item.quantity || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="my-2 border-[#EAE5DA]" />

                  {/* TOTAL AMOUNT */}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#2D3028]">
                      Total Amount
                    </span>

                    <span className="text-lg font-bold text-[#E3432E]">
                      ₹{getTotalAmount(order)}
                    </span>
                  </div>

                  {/* PAYMENT DETAILS */}
                  <div className="mt-2 bg-[#FAF8F2] p-2 rounded-lg">
                    <h3 className="font-bold text-xs text-[#2D3028] mb-2">
                      Payment Details
                    </h3>

                    <div className="flex justify-between items-center gap-2 text-[11px]">
                      <span className="text-[#77766F]">
                        Payment Method
                      </span>

                      <span className="font-semibold text-[#2D3028]">
                        {getPaymentMethod(order)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 text-[11px] mt-2">
                      <span className="text-[#77766F]">
                        Payment Status
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold ${getPaymentStyle(
                          order
                        )}`}
                      >
                        {getPaymentStatus(order)}
                      </span>
                    </div>
                  </div>

                  {/* ACCEPT / REJECT */}
                  {isPending && (
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={updatingId === order._id}
                        onClick={() =>
                          updateStatus(order._id, "Accepted")
                        }
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingId === order._id
                          ? "Updating..."
                          : "Accept Order"}
                      </button>

                      <button
                        disabled={updatingId === order._id}
                        onClick={() =>
                          updateStatus(order._id, "Rejected")
                        }
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject Order
                      </button>
                    </div>
                  )}

                  {/* DELIVERY MANAGEMENT */}
                  {nextStatus && (
                    <div className="mt-3 bg-[#FAF8F2] p-2 rounded-lg">
                      <h3 className="font-bold text-xs text-[#2D3028] mb-1.5">
                        Delivery Management
                      </h3>

                      <p className="text-[11px] text-[#77766F] mb-2">
                        Current Status: {order.status}
                      </p>

                      <button
                        disabled={updatingId === order._id}
                        onClick={() =>
                          updateStatus(order._id, nextStatus.status)
                        }
                        className={`w-full text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50 ${nextStatus.color}`}
                      >
                        {updatingId === order._id
                          ? "Updating..."
                          : nextStatus.label}
                      </button>
                    </div>
                  )}

                  {/* DELIVERED MESSAGE */}
                  {order.status === "Delivered" && (
                    <div className="mt-3 bg-blue-50 text-blue-700 p-2 rounded-lg text-xs font-semibold text-center">
                      Order Successfully Delivered!
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MORE / VIEW LESS */}
        {!loading && totalOrders > 2 && (
          <div className="flex justify-center mt-7">
            <button
              onClick={() => setShowAllOrders(!showAllOrders)}
              className="bg-[#E3432E] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#c93422] shadow-sm"
            >
              {showAllOrders
                ? "View Less"
                : `View More Orders (${totalOrders - 2})`}
            </button>
          </div>
        )}

        {/* RESTAURANT LOCATION */}
        <div className="mt-10">
          <RestaurantLocation />
        </div>

        {/* OFFER MANAGEMENT */}
        <div className="mt-10">
          <OfferManagement />
        </div>

      </div>
    </section>
  );
}

export default RestaurantAdmin;
