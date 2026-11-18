
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "https://foodie-1-ck6c.onrender.com/api";

function Profile() {
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("foodieUser") || "null") || {}
  );

  const [favourites, setFavourites] = useState([]);
  const [loadingFavourites, setLoadingFavourites] = useState(true);

  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("foodieToken");

      if (!token) {
        setLoadingFavourites(false);
        return;
      }

      try {
        const response = await fetch(`${API}/favourites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load favourites");
        }

        const data = await response.json();
        setFavourites(data.favourites || []);
      } catch (error) {
        console.error("Favourite Fetch Error:", error);
      } finally {
        setLoadingFavourites(false);
      }
    };

    fetchFavourites();
  }, []);

  const getFoodImage = (food) => {
    const image = food?.image || "";

    if (!image) {
      return "https://placehold.co/400x300/fff0df/9a3412?text=Food";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=400&h=300&q=80`;
  };

  return (
    <section className="min-h-screen bg-[#FAF8F2] py-10 px-5">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-[#2D3028] mb-5">
          My Profile
        </h1>

        <div className="bg-white rounded-2xl border border-[#EAE5DA] p-5 shadow-sm">

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E3432E] flex items-center justify-center text-white text-2xl font-bold">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#2D3028]">
                {user.name || "Customer"}
              </h2>

              <p className="text-sm text-[#77766F] mt-1">
                {user.email || "Your Email"}
              </p>

              <p className="text-xs text-[#77766F] mt-1">
                Foodie Customer
              </p>
            </div>
          </div>

          <hr className="my-5 border-[#EAE5DA]" />

          {/* Personal Information */}
          <h2 className="text-lg font-bold text-[#2D3028] mb-4">
            Personal Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#77766F]">Full Name</p>
              <p className="font-semibold text-sm text-[#2D3028] mt-1">
                {user.name || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#77766F]">Email Address</p>
              <p className="font-semibold text-sm text-[#2D3028] mt-1">
                {user.email || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#77766F]">Phone Number</p>
              <p className="font-semibold text-sm text-[#2D3028] mt-1">
                {user.phone || "Not added"}
              </p>
            </div>
          </div>

          <hr className="my-5 border-[#EAE5DA]" />

          {/* My Orders */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#2D3028]">
                My Orders
              </h2>
              <p className="text-xs text-[#77766F] mt-1">
                View your food orders and their status.
              </p>
            </div>

            <Link
              to="/my-orders"
              className="bg-[#E3432E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#c93625] transition"
            >
              View Orders
            </Link>
          </div>

          <hr className="my-5 border-[#EAE5DA]" />

          {/* MY FAVOURITE FOODS */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#2D3028]">
                  My Favourite Foods
                </h2>

                <p className="text-xs text-[#77766F] mt-1">
                  Your saved favourite dishes.
                </p>
              </div>

              <span className="text-sm font-semibold text-[#E3432E]">
                {favourites.length} Saved
              </span>
            </div>

            {loadingFavourites ? (
              <p className="text-sm text-[#77766F] py-5 text-center">
                Loading favourites...
              </p>
            ) : favourites.length === 0 ? (
              <div className="bg-[#FAF8F2] rounded-xl p-6 text-center">
                <p className="text-3xl text-[#E3432E]">♡</p>

                <h3 className="font-semibold text-[#2D3028] mt-2">
                  No Favourite Foods Yet
                </h3>

                <p className="text-sm text-[#77766F] mt-1">
                  Add foods to your favourites from the Menu.
                </p>

                <Link
                  to="/menu"
                  className="inline-block mt-4 bg-[#E3432E] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#c93625]"
                >
                  Explore Menu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favourites.map((food) => (
                  food && food._id ? (
                    <div
                      key={food._id}
                      className="border border-[#EAE5DA] rounded-xl overflow-hidden bg-white hover:shadow-md transition"
                    >
                      <img
                        src={getFoodImage(food)}
                        alt={food.name}
                        className="w-full h-36 object-cover"
                      />

                      <div className="p-3">
                        <div className="flex justify-between items-center gap-2">
                          <h3 className="font-bold text-[#2D3028]">
                            {food.name}
                          </h3>

                          <span className="text-[#E3432E] text-lg">
                            ♥
                          </span>
                        </div>

                        <p className="text-xs text-[#77766F] mt-1">
                          {food.category}
                        </p>

                        <p className="font-bold text-[#E3432E] mt-2">
                          ₹{food.price}
                        </p>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>

          <hr className="my-5 border-[#EAE5DA]" />

          {/* Delivery Address */}
          <h2 className="text-lg font-bold text-[#2D3028] mb-2">
            Delivery Address
          </h2>

          <p className="text-sm text-[#77766F]">
            Your saved delivery addresses will appear here.
          </p>

        </div>
      </div>
    </section>
  );
}

export default Profile;
