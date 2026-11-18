
import React, { useEffect, useState } from "react";
import { useCart } from "./Cartcontext";
import { useNavigate } from "react-router-dom";

const API = "https://foodie-1-ck6c.onrender.com/api";

// Load Razorpay Checkout
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("foodieUser") || "{}"
  );

  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Customer GPS
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  // GET CUSTOMER CURRENT GPS LOCATION
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser does not support GPS.");
      return;
    }

    setGettingLocation(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationMessage("Current location detected successfully!");
        setGettingLocation(false);
      },
      (error) => {
        console.log("GPS Error:", error);

        setLocationMessage(
          error.code === 1
            ? "Location permission denied. Please allow GPS access."
            : "Unable to detect location. Please try again."
        );

        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Offers states
  const [showOffers, setShowOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState("");

  const subtotal = Number(cartTotal) || 0;

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API}/offers`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load offers");
        }

        const offerList = Array.isArray(data)
          ? data
          : data.offers || [];

        const validOffers = offerList.filter(
          (offer) =>
            offer.isActive &&
            new Date(offer.expiryDate) > new Date()
        );

        setOffers(validOffers);
      } catch (error) {
        console.error("Offer Error:", error);
      }
    };

    fetchOffers();
  }, []);

  const selectedOfferData = offers.find(
    (offer) => offer._id === selectedOffer
  );

  const minimumAmount = Number(
    selectedOfferData?.minimumOrderAmount || 0
  );

  const isOfferValid =
    selectedOfferData && subtotal >= minimumAmount;

  const discount = isOfferValid
    ? Math.round(
        (subtotal *
          Number(selectedOfferData.discountPercentage) /
          100) *
          100
      ) / 100
    : 0;

  const finalTotal = Math.max(0, subtotal - discount);

  // Common order data
  const getOrderPayload = (cleanPhone) => ({
    items: cart.map((food) => ({
      foodId: food._id || food.id,
      quantity: Number(food.quantity),
    })),

    deliveryAddress: address.trim(),
    phone: cleanPhone,

    deliveryLocation:
      latitude !== "" && longitude !== ""
        ? {
            latitude: Number(latitude),
            longitude: Number(longitude),
          }
        : null,

    couponCode: isOfferValid
      ? selectedOfferData.couponCode
      : "",
  });

  // COD ORDER
  const placeCODOrder = async (token, payload) => {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Order failed");
    }

    clearCart();
    alert("Order placed successfully! Payment Method: Cash on Delivery");
    navigate("/");
  };

  // RAZORPAY ONLINE PAYMENT
  const startOnlinePayment = async (token, payload) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Unable to load Razorpay. Please try again.");
    }

    // Create Razorpay Order
    const res = await fetch(`${API}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Unable to create payment order");
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency || "INR",
      name: "Foodie",
      description: "Food Order Payment",
      order_id: data.razorpayOrderId,

      prefill: {
        name: user.name || "",
        email: user.email || "",
        contact: phone,
      },

      theme: {
        color: "#E3432E",
      },

      handler: async function (response) {
        try {
          // Verify Payment on Backend
          const verifyRes = await fetch(`${API}/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            throw new Error(
              verifyData.message || "Payment verification failed"
            );
          }

          clearCart();
          alert("Payment successful! Your order has been placed.");
          navigate("/");
        } catch (error) {
          console.error("Payment Verification Error:", error);
          alert(error.message || "Payment verification failed.");
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("Payment Failed:", response.error);
      alert(
        response.error?.description || "Payment failed. Please try again."
      );
      setLoading(false);
    });

    razorpay.open();
  };

  // PLACE ORDER
  const placeOrder = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("foodieToken");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!cart.length) {
      alert("Your cart is empty!");
      return;
    }

    const cleanPhone = phone.trim();

    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!address.trim()) {
      alert("Please enter your delivery address");
      return;
    }

    if (selectedOffer && !isOfferValid) {
      alert(
        `Minimum order amount for this offer is ₹${minimumAmount}`
      );
      return;
    }

    const invalidFood = cart.some(
      (food) => !(food._id || food.id)
    );

    if (invalidFood) {
      alert(
        "Food ID missing. Please refresh the menu and add food again."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = getOrderPayload(cleanPhone);

      if (paymentMethod === "COD") {
        await placeCODOrder(token, payload);
      } else {
        await startOnlinePayment(token, payload);
      }
    } catch (error) {
      console.error("Order/Payment Error:", error);
      alert(error.message || "Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF8F2] pt-32 px-5 pb-16">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-[#EAE5DA] shadow-sm">

        <h1 className="text-3xl font-bold text-[#2D3028] mb-6">
          Checkout
        </h1>

        <form onSubmit={placeOrder}>

          {/* Customer Name */}
          <input
            type="text"
            value={user.name || ""}
            readOnly
            placeholder="Full Name"
            className="w-full p-3 border border-[#EAE5DA] rounded-xl mb-4 outline-none"
          />

          {/* Customer Email */}
          <input
            type="email"
            value={user.email || ""}
            readOnly
            placeholder="Email"
            className="w-full p-3 border border-[#EAE5DA] rounded-xl mb-4 outline-none"
          />

          {/* Phone Number */}
          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder="Mobile Number"
            maxLength={10}
            required
            className="w-full p-3 border border-[#EAE5DA] rounded-xl mb-4 outline-none focus:border-[#E3432E]"
          />

          {/* Delivery Address */}
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Delivery Address"
            required
            rows="3"
            className="w-full p-3 border border-[#EAE5DA] rounded-xl mb-3 outline-none focus:border-[#E3432E] resize-none"
          />

          {/* Customer GPS Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white p-3 rounded-xl font-semibold transition"
            >
              {gettingLocation
                ? "Detecting Location..."
                : "Get My Current GPS Location"}
            </button>

            {locationMessage && (
              <p className="text-sm text-center text-[#77766F] mt-2">
                {locationMessage}
              </p>
            )}

            {latitude !== "" && longitude !== "" && (
              <div className="bg-[#FAF8F2] rounded-xl p-3 mt-3 text-sm text-[#2D3028]">
                <p className="font-semibold text-green-700 mb-1">
                  Customer GPS Location Detected
                </p>
                <p>Latitude: {latitude}</p>
                <p>Longitude: {longitude}</p>
              </div>
            )}
          </div>

          {/* Offers Checkbox */}
          <div className="border border-[#EAE5DA] rounded-xl p-4 mb-5">

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showOffers}
                onChange={(e) => {
                  setShowOffers(e.target.checked);
                  setSelectedOffer("");
                }}
                className="w-4 h-4 accent-[#E3432E]"
              />

              <span className="font-semibold text-[#2D3028]">
                Use Offers / Apply Coupon
              </span>
            </label>

            {showOffers && (
              <div className="mt-4">

                {offers.length === 0 ? (
                  <p className="text-sm text-[#77766F]">
                    No offers available right now.
                  </p>
                ) : (
                  <select
                    value={selectedOffer}
                    onChange={(e) =>
                      setSelectedOffer(e.target.value)
                    }
                    className="w-full p-3 border border-[#EAE5DA] rounded-xl outline-none focus:border-[#E3432E]"
                  >
                    <option value="">Select an offer</option>

                    {offers.map((offer) => (
                      <option
                        key={offer._id}
                        value={offer._id}
                      >
                        {offer.title} - {offer.discountPercentage}% OFF
                      </option>
                    ))}
                  </select>
                )}

                {selectedOfferData && (
                  <div className="mt-3 bg-[#FAF8F2] rounded-xl p-3">

                    <p className="font-semibold text-[#2D3028]">
                      {selectedOfferData.title}
                    </p>

                    <p className="text-sm text-[#77766F] mt-1">
                      {selectedOfferData.description}
                    </p>

                    <p className="text-sm mt-2">
                      Coupon Code:{" "}
                      <span className="font-bold text-[#E3432E]">
                        {selectedOfferData.couponCode}
                      </span>
                    </p>

                    <p className="text-sm text-[#77766F] mt-1">
                      Minimum Order: ₹{minimumAmount}
                    </p>

                    {!isOfferValid && (
                      <p className="text-sm text-red-600 mt-2">
                        Add ₹{(minimumAmount - subtotal).toFixed(2)} more
                        to use this offer.
                      </p>
                    )}

                    {isOfferValid && (
                      <p className="text-sm text-green-700 mt-2 font-semibold">
                        Offer applied successfully!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price Details */}
          <div className="border-t border-[#EAE5DA] pt-4 mb-5 space-y-3">

            <div className="flex justify-between text-[#77766F]">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold text-[#2D3028]">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-[#EAE5DA] rounded-xl p-4 mb-5">

            <h2 className="font-bold text-lg text-[#2D3028] mb-3">
              Select Payment Method
            </h2>

            {/* Cash on Delivery */}
            <label className="flex items-center gap-3 p-3 border border-[#EAE5DA] rounded-xl mb-3 cursor-pointer hover:border-[#E3432E]">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="accent-[#E3432E] w-4 h-4"
              />

              <div>
                <p className="font-semibold text-[#2D3028]">
                  Cash on Delivery
                </p>
                <p className="text-sm text-[#77766F]">
                  Pay cash when your order arrives.
                </p>
              </div>
            </label>

            {/* Online Payment */}
            <label className="flex items-center gap-3 p-3 border border-[#EAE5DA] rounded-xl cursor-pointer hover:border-[#E3432E]">
              <input
                type="radio"
                name="paymentMethod"
                value="Online"
                checked={paymentMethod === "Online"}
                onChange={() => setPaymentMethod("Online")}
                className="accent-[#E3432E] w-4 h-4"
              />

              <div>
                <p className="font-semibold text-[#2D3028]">
                  Online Payment
                </p>
                <p className="text-sm text-[#77766F]">
                  Pay using Razorpay Test Checkout.
                </p>
              </div>
            </label>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={!cart.length || loading}
            className="w-full bg-[#E3432E] hover:bg-[#c93422] disabled:opacity-60 text-white p-3 rounded-xl font-semibold transition"
          >
            {loading
              ? "Please Wait..."
              : paymentMethod === "COD"
                ? "Place Order"
                : "Pay ₹" + finalTotal.toFixed(2)}
          </button>

        </form>
      </div>
    </section>
  );
}

export default Checkout;
