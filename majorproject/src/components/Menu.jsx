
import React, { useEffect, useState } from "react";
import { useCart } from "./Cartcontext";

const API = "http://localhost:5000/api";

const Menu = ({ search = "", setSearch }) => {
  const { addToCart } = useCart();

  const [foods, setFoods] = useState([]);
  const [ratings, setRatings] = useState({});
  const [favourites, setFavourites] = useState([]);
  const [cartMessage, setCartMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // FETCH FOODS
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/foods`);

        if (!response.ok) {
          throw new Error("Failed to fetch foods");
        }

        const data = await response.json();

        const foodList = Array.isArray(data)
          ? data
          : Array.isArray(data.foods)
          ? data.foods
          : [];

        setFoods(foodList);
      } catch (error) {
        console.error("Food Fetch Error:", error);
        setError(
          "Unable to load food items. Please check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // FETCH SAVED FAVOURITES FROM DATABASE
  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("foodieToken");

      if (!token) return;

      try {
        const response = await fetch(`${API}/favourites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status !== 403 && response.status !== 401) {
            console.error("Unable to fetch favourites");
          }
          return;
        }

        const data = await response.json();

        const favouriteIds = (data.favourites || []).map((food) =>
          typeof food === "string" ? food : food._id
        );

        setFavourites(favouriteIds);
      } catch (error) {
        console.error("Favourite Fetch Error:", error);
      }
    };

    fetchFavourites();
  }, []);

  // FETCH RATINGS
  useEffect(() => {
    if (!foods.length) return;

    const fetchRatings = async () => {
      const results = await Promise.all(
        foods.map(async (food) => {
          try {
            const response = await fetch(
              `${API}/ratings/food/${food._id}`
            );

            if (!response.ok) {
              return [
                food._id,
                { averageRating: 0, totalRatings: 0 },
              ];
            }

            const data = await response.json();

            return [
              food._id,
              {
                averageRating: data.averageRating || 0,
                totalRatings: data.totalRatings || 0,
              },
            ];
          } catch (error) {
            console.error("Rating Error:", error);

            return [
              food._id,
              { averageRating: 0, totalRatings: 0 },
            ];
          }
        })
      );

      setRatings(Object.fromEntries(results));
    };

    fetchRatings();
  }, [foods]);

  // FOOD IMAGE
  const getFoodImage = (food) => {
    const image = food?.image || "";

    if (!image) {
      return "https://placehold.co/600x400/fff0df/9a3412?text=Food+Image";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=600&h=400&q=80`;
  };

  // ADD TO CART
  const handleAddToCart = (food) => {
    if (
      !food._id ||
      !/^[0-9a-fA-F]{24}$/.test(String(food._id))
    ) {
      alert("Invalid food ID. Please refresh the menu.");
      return;
    }

    if (!food.restaurant) {
      alert("Restaurant information is missing for this food.");
      return;
    }

    addToCart(food);

    setCartMessage(`${food.name} added to cart successfully!`);

    setTimeout(() => {
      setCartMessage("");
    }, 1500);
  };


 // ADD / REMOVE FAVOURITE IN DATABASE + NOTIFICATION
const toggleFavourite = async (foodId) => {
  const token = localStorage.getItem("foodieToken");

  if (!token) {
    alert("Please login as a customer to save favourite foods.");
    return;
  }

  const alreadyFavourite = favourites.includes(foodId);

  try {
    const response = await fetch(
      `${API}/favourites/${foodId}`,
      {
        method: alreadyFavourite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Favourite update failed");
    }

    setFavourites((prev) =>
      alreadyFavourite
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );

    setCartMessage(
      alreadyFavourite
        ? "Food removed from your favourite list!"
        : "Food added to your favourite list!"
    );

    setTimeout(() => {
      setCartMessage("");
    }, 2500);

  } catch (error) {
    console.error("Favourite Error:", error);
    alert(error.message || "Unable to update favourite. Please try again.");
  }
};

  // CATEGORIES
  const allCategories = [
    "Juice",
    "Burger",
    "Pizza",
    "SpringRoll",
  ];

  const categories = [
    "All",
    ...allCategories.filter((category) =>
      foods.some(
        (food) =>
          food.category?.toLowerCase() === category.toLowerCase()
      )
    ),
  ];

  // FILTER FOODS
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      `${food.name || ""} ${food.category || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      food.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <section
      id="menu"
      className="bg-[#FAF8F2] py-20 px-5 md:px-10"
    >
      {/* SUCCESS MESSAGE */}
      {cartMessage && (
        <div className="fixed top-20 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
          ✓ {cartMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* MENU HEADING */}
        <div className="text-center mb-12">
          <p className="text-[#E3432E] font-semibold text-xs tracking-[0.3em] uppercase">
            • Fresh & Delicious
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#2D3028] mt-3">
            Our Food <span className="text-[#E3432E]">Menu</span>
          </h2>

          <p className="text-[#77766F] mt-4">
            Delicious food, amazing taste, delivered to your door!
          </p>

          <p className="text-[#E3432E] font-semibold mt-4">
            Explore All {foods.length} Items
          </p>

          <div className="w-20 h-1 bg-[#E3432E] rounded-full mx-auto mt-5" />
        </div>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mt-8 mb-10">
          <input
            type="text"
            placeholder="Search burgers, pizza, momos..."
            value={search}
            onChange={(e) =>
              setSearch && setSearch(e.target.value)
            }
            className="w-full px-5 py-4 rounded-2xl border border-[#EAE5DA] bg-white text-[#2D3028] focus:outline-none focus:border-[#E3432E] focus:ring-2 focus:ring-[#E3432E]/20 shadow-sm"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center py-10 text-[#77766F]">
            Loading delicious food...
          </p>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center py-10">
            <p className="text-red-600 font-semibold">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#E3432E] text-white px-6 py-3 rounded-xl"
            >
              Refresh Menu
            </button>
          </div>
        )}

        {/* CATEGORY CIRCLES */}
        {!loading && !error && (
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-[#2D3028] mb-2">
              Explore our menu
            </h2>

            <p className="text-sm text-[#77766F] mb-7">
              Choose your favourite food category
            </p>

            <div className="flex justify-center gap-8 md:gap-16 overflow-x-auto pb-5">
              {categories.map((category) => {
                const categoryFood = foods.find((food) =>
                  category === "All"
                    ? true
                    : food.category?.toLowerCase() ===
                      category.toLowerCase()
                );

                return (
                  <div
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-0 shadow-md group-hover:scale-105 transition-all duration-300">
                      <img
                        src={
                          categoryFood
                            ? getFoodImage(categoryFood)
                            : "https://placehold.co/200x200?text=Food"
                        }
                        alt={category}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p
                      className={`text-sm font-semibold mt-3 text-center ${
                        selectedCategory === category
                          ? "text-[#E3432E]"
                          : "text-[#444]"
                      }`}
                    >
                      {category}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-b border-[#EAE5DA] mt-5" />
          </div>
        )}

        {/* FOOD CARDS */}
        {!loading && !error && (
          <div>
            <h2 className="text-2xl font-bold text-[#2D3028] mb-7">
              Top dishes near you
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => {
                  const rating = ratings[food._id] || {
                    averageRating: 0,
                    totalRatings: 0,
                  };

                  const isFavourite = favourites.includes(food._id);

                  return (
                    <div
                      key={food._id}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#EAE5DA] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                    >
                      {/* FOOD IMAGE */}
                      <div className="relative overflow-hidden">
                        <img
                          src={getFoodImage(food)}
                          alt={food.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/600x400/fff0df/9a3412?text=Food+Image";
                          }}
                          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* FAVOURITE HEART */}
                        <button
                          type="button"
                          onClick={() => toggleFavourite(food._id)}
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-2xl hover:scale-110 transition-all"
                          aria-label={
                            isFavourite
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                        >
                          <span
                            className={
                              isFavourite
                                ? "text-[#E3432E]"
                                : "text-gray-500"
                            }
                          >
                            {isFavourite ? "♥" : "♡"}
                          </span>
                        </button>
                      </div>

                      {/* FOOD DETAILS */}
                      <div className="p-5">
                        <span className="inline-block text-xs font-semibold text-[#E3432E] bg-[#FAF0E8] px-3 py-1.5 rounded-full">
                          {food.category}
                        </span>

                        <h3 className="text-lg font-bold text-[#2D3028] mt-3">
                          {food.name}
                        </h3>

                        {/* RATINGS */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-yellow-500 tracking-wider">
                            {"★".repeat(
                              Math.round(rating.averageRating)
                            )}
                            {"☆".repeat(
                              5 - Math.round(rating.averageRating)
                            )}
                          </span>

                          <span className="text-sm font-semibold text-[#2D3028]">
                            {rating.totalRatings > 0
                              ? rating.averageRating.toFixed(1)
                              : "New"}
                          </span>

                          <span className="text-xs text-[#77766F]">
                            ({rating.totalRatings} reviews)
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-5 gap-2">
                          <span className="text-2xl font-bold text-[#E3432E]">
                            ₹{food.price}
                          </span>

                          <button
                            onClick={() => handleAddToCart(food)}
                            className="bg-[#E3432E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#C93422] active:scale-95 transition-all"
                          >
                            Add to Cart +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-2xl font-bold text-[#2D3028]">
                    No Food Items Available
                  </h3>

                  <p className="text-[#77766F] mt-3">
                    Restaurant Admin needs to add food items first.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center mt-16">
          <p className="text-[#77766F] text-sm">
            Made for food lovers
          </p>
        </div>
      </div>
    </section>
  );
};

export default Menu;
