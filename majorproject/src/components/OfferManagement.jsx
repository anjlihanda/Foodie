
import React, { useEffect, useState } from "react";

function OfferManagement() {
  const token = localStorage.getItem("foodieToken");

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    couponCode: "",
    discountPercentage: "",
    minimumOrderAmount: "0",
    expiryDate: "",
  });

  const API = "https://foodie-1-ck6c.onrender.com/api/offers";

  const fetchOffers = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (response.ok) {
        setOffers(data.offers || []);
      } else {
        setMessage(data.message || "Unable to load offers");
      }
    } catch (error) {
      setMessage("Offers server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const createOffer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          couponCode: form.couponCode.trim().toUpperCase(),
          discountPercentage: Number(form.discountPercentage),
          minimumOrderAmount: Number(form.minimumOrderAmount),
          expiryDate: new Date(form.expiryDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Offer created successfully!");

        setForm({
          title: "",
          description: "",
          couponCode: "",
          discountPercentage: "",
          minimumOrderAmount: "0",
          expiryDate: "",
        });

        fetchOffers();
      } else {
        setMessage(data.message || "Offer creation failed");
      }
    } catch (error) {
      setMessage("Server error while creating offer");
    } finally {
      setSaving(false);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Offer deleted successfully!");
        fetchOffers();
      } else {
        setMessage(data.message || "Delete failed");
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <div className="mt-10">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#2D3028]">
          Manage Offers
        </h2>
        <p className="text-sm text-[#77766F] mt-1">
          Create and manage restaurant discount coupons.
        </p>
      </div>

      <form
        onSubmit={createOffer}
        className="bg-white border border-[#EAE5DA] rounded-2xl p-5 shadow-sm"
      >
        <h3 className="text-lg font-bold text-[#2D3028] mb-4">
          Create New Offer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Offer Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-[#EAE5DA] rounded-xl p-3 outline-none"
          />

          <input
            type="text"
            placeholder="Coupon Code (e.g. FOOD20)"
            required
            value={form.couponCode}
            onChange={(e) =>
              setForm({ ...form, couponCode: e.target.value.toUpperCase() })
            }
            className="border border-[#EAE5DA] rounded-xl p-3 outline-none"
          />

          <input
            type="number"
            placeholder="Discount Percentage"
            min="1"
            max="100"
            required
            value={form.discountPercentage}
            onChange={(e) =>
              setForm({ ...form, discountPercentage: e.target.value })
            }
            className="border border-[#EAE5DA] rounded-xl p-3 outline-none"
          />

          <input
            type="number"
            placeholder="Minimum Order Amount"
            min="0"
            value={form.minimumOrderAmount}
            onChange={(e) =>
              setForm({ ...form, minimumOrderAmount: e.target.value })
            }
            className="border border-[#EAE5DA] rounded-xl p-3 outline-none"
          />

          <input
            type="datetime-local"
            required
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            className="border border-[#EAE5DA] rounded-xl p-3 outline-none"
          />

          <textarea
            placeholder="Offer Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-[#EAE5DA] rounded-xl p-3 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 bg-[#E3432E] text-white px-7 py-3 rounded-xl font-semibold hover:bg-[#c93422] disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Offer"}
        </button>

        {message && (
          <p className="mt-3 text-sm font-semibold text-[#E3432E]">
            {message}
          </p>
        )}
      </form>

      <div className="mt-7">
        <h3 className="text-xl font-bold text-[#2D3028] mb-4">
          Your Available Offers
        </h3>

        {loading ? (
          <p>Loading offers...</p>
        ) : offers.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-[#EAE5DA] text-center">
            No offers created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white p-5 rounded-2xl border border-[#EAE5DA]"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-lg text-[#2D3028]">
                      {offer.title}
                    </h4>
                    <p className="text-sm text-[#77766F] mt-1">
                      {offer.description}
                    </p>
                  </div>

                  <span className="text-xl font-bold text-[#E3432E]">
                    {offer.discountPercentage}% OFF
                  </span>
                </div>

                <div className="mt-4 bg-[#FAF8F2] p-3 rounded-xl">
                  <p className="text-xs text-[#77766F]">Coupon Code</p>
                  <p className="font-bold text-[#E3432E]">
                    {offer.couponCode}
                  </p>
                </div>

                <p className="text-sm mt-3 text-[#77766F]">
                  Minimum Order: ₹{offer.minimumOrderAmount}
                </p>

                <p className="text-sm text-[#77766F] mt-1">
                  Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                </p>

                <button
                  onClick={() => deleteOffer(offer._id)}
                  className="mt-4 bg-red-100 text-red-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-200"
                >
                  Delete Offer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OfferManagement;
