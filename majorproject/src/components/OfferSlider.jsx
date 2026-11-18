
import React, { useEffect, useState } from "react";

function OfferSlider() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  const API = "https://foodie-1-ck6c.onrender.com/api/offers";

  const fetchOffers = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (response.ok) {
        const activeOffers = (data.offers || []).filter(
          (offer) =>
            offer.isActive !== false &&
            new Date(offer.expiryDate) > new Date()
        );

        setOffers(activeOffers);
        setCurrent(0);
      }
    } catch (error) {
      console.log("Offer loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (offers.length <= 1) return;

    const slider = setInterval(() => {
      setCurrent((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(slider);
  }, [offers]);

  if (loading || offers.length === 0) return null;

  const offer = offers[current];

  return (
    <section className="w-full px-4 md:px-8 py-7">

      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-bold text-[#2D3028]">
          Special Offers
        </h2>
        <p className="text-sm text-[#77766F] mt-1">
          Grab exciting discounts on your favourite food!
        </p>
      </div>

      <div
        key={offer._id}
        className="relative w-full overflow-hidden rounded-3xl
bg-[#E96B58] text-white shadow-lg
p-7 md:p-12 flex items-center"
      >

        <div className="relative z-10 w-full md:w-3/4">

          <p className="text-sm font-bold uppercase tracking-[3px] text-white/90">
            Special Foodie Offer
          </p>

          <h3 className="text-2xl md:text-4xl font-extrabold mt-4">
            {offer.title}
          </h3>

          <p className="text-5xl md:text-6xl font-black mt-4">
            {offer.discountPercentage}% OFF
          </p>

          <p className="text-sm md:text-base mt-4 text-white/95">
            {offer.description}
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-6">

            <div className="bg-white text-[#E3432E] rounded-xl px-6 py-3 shadow-md">
              <p className="text-xs font-semibold">
                USE COUPON CODE
              </p>
              <p className="text-xl font-extrabold tracking-widest">
                {offer.couponCode}
              </p>
            </div>

            <div className="text-sm text-white/95">
              <p>Minimum Order: ₹{offer.minimumOrderAmount}</p>
              <p className="mt-1">
                Valid Till: {new Date(offer.expiryDate).toLocaleDateString()}
              </p>
            </div>

          </div>
        </div>

        <div className="absolute -right-12 -bottom-24 w-72 h-72
          rounded-full  border-white/10" />

        

      </div>

      {offers.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {offers.map((item, index) => (
            <button
              key={item._id}
              onClick={() => setCurrent(index)}
              className={`h-2.5 rounded-full transition-all ${
                current === index
                  ? "w-8 bg-[#E3432E]"
                  : "w-2.5 bg-[#D8CFC5]"
              }`}
              aria-label={`Show offer ${index + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}

export default OfferSlider;
