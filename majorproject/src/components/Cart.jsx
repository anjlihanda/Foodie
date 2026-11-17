
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./Cartcontext";

const Cart = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  } = useCart();

  const navigate = useNavigate();

  const getFoodImage = (food) => {
    if (!food.image) {
      return "https://placehold.co/300x300?text=Food";
    }

    if (food.image.startsWith("http")) {
      return food.image;
    }

    return `https://images.unsplash.com/${food.image}?auto=format&fit=crop&w=300&h=300&q=80`;
  };

  return (
    <section className="min-h-screen bg-[#FAF8F2] pt-32 pb-16 px-5 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="mb-10">
          <p className="text-[#E3432E] font-semibold text-sm uppercase tracking-widest">
            Foodie Shopping
          </p>

          <h1 className="text-4xl font-bold text-[#2D3028] mt-2">
            Your Cart 🛒
          </h1>

          <p className="text-[#77766F] mt-2">
            Review your delicious food before checkout.
          </p>
        </div>

        {cart.length === 0 ? (

          <div className="bg-white rounded-3xl border border-[#EAE5DA] p-10 md:p-16 text-center shadow-sm">

            <div className="text-6xl mb-5">🛒</div>

            <h2 className="text-2xl font-bold text-[#2D3028]">
              Your Cart is Empty!
            </h2>

            <p className="text-[#77766F] mt-3 mb-7">
              You haven't added any delicious food yet.
            </p>

            <Link
              to="/"
              className="inline-block bg-[#E3432E] text-white px-7 py-3 rounded-full font-semibold hover:bg-[#B85C38] transition"
            >
              Explore Menu →
            </Link>

          </div>

        ) : (

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-5">

              {cart.map((food) => (

                <div
                  key={food._id}
                  className="bg-white rounded-2xl border border-[#EAE5DA] p-4 md:p-5 flex flex-col sm:flex-row gap-5 shadow-sm"
                >

                  <img
                    src={getFoodImage(food)}
                    alt={food.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/300x300?text=Food";
                    }}
                    className="w-full sm:w-32 h-32 object-cover rounded-xl"
                  />

                  <div className="flex-1">

                    <div className="flex justify-between gap-3">

                      <div>
                        <h3 className="text-xl font-bold text-[#2D3028]">
                          {food.name}
                        </h3>

                        <p className="text-sm text-[#77766F] mt-1">
                          {food.category}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(food._id)}
                        className="text-red-500 text-sm font-semibold hover:text-red-700"
                      >
                        Remove ✕
                      </button>

                    </div>

                    <p className="text-[#E3432E] font-bold text-lg mt-3">
                      ₹{food.price}
                    </p>

                    <div className="flex items-center gap-4 mt-3">

                      <div className="flex items-center border border-[#EAE5DA] rounded-lg overflow-hidden">

                        <button
                          onClick={() =>
                            updateQuantity(food._id, -1)
                          }
                          className="px-4 py-2 hover:bg-[#FAF0E8] font-bold"
                        >
                          −
                        </button>

                        <span className="px-3 font-semibold text-[#2D3028]">
                          {food.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(food._id, 1)
                          }
                          className="px-4 py-2 hover:bg-[#FAF0E8] font-bold"
                        >
                          +
                        </button>

                      </div>

                      <span className="font-bold text-[#2D3028]">
                        ₹{Number(food.price) * food.quantity}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

              <Link
                to="/"
                className="inline-block text-[#E3432E] font-semibold hover:underline"
              >
                ← Continue Shopping
              </Link>

            </div>

            {/* Order Summary */}
            <div>

              <div className="bg-white rounded-2xl border border-[#EAE5DA] p-6 shadow-sm sticky top-28">

                <h2 className="text-2xl font-bold text-[#2D3028] mb-6">
                  Order Summary
                </h2>

                <div className="flex justify-between text-[#77766F] mb-4">
                  <span>Total Items</span>
                  <span>{cartCount}</span>
                </div>

                <div className="flex justify-between text-[#77766F] mb-4">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                <div className="flex justify-between text-[#77766F] mb-4">
                  <span>Delivery Fee</span>
                  <span>₹0</span>
                </div>

                <div className="border-t border-[#EAE5DA] pt-5 mt-5 flex justify-between">

                  <span className="font-bold text-lg text-[#2D3028]">
                    Total
                  </span>

                  <span className="font-bold text-2xl text-[#E3432E]">
                    ₹{cartTotal}
                  </span>

                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#E3432E] text-white py-3 rounded-xl font-semibold mt-7 hover:bg-[#B85C38] transition"
                >
                  Proceed to Checkout →
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </section>
  );
};

export default Cart;
