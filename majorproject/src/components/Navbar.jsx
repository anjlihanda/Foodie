
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./Cartcontext";

function Navbar({ search, setSearch }) {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("foodieUser") || "{}");
  } catch (error) {
    user = {};
  }

  const token = localStorage.getItem("foodieToken");
  const isLoggedIn = Boolean(token && (user.id || user._id));
  const isRestaurantAdmin = user.role === "restaurantAdmin";

  const profileName = user.name || "Anjli";

  const handleLogout = () => {
    localStorage.removeItem("foodieToken");
    localStorage.removeItem("foodieUser");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FAF8F2] border-b border-[#EAE5DA]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

        {/* Logo */}
        <a
          href="/#home"
          className="text-2xl font-bold text-[#E3432E] flex items-center gap-2"
        >
          ✿ Foodie
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2D3028]">

          <a href="/#home" className="hover:text-[#E3432E] transition">
            Home
          </a>

          <a href="/#about" className="hover:text-[#E3432E] transition">
            About
          </a>

          <a href="/#services" className="hover:text-[#E3432E] transition">
            Services
          </a>

          <a href="/#menu" className="hover:text-[#E3432E] transition">
            Menu
          </a>

          {/* Login / Restaurant Dashboard */}
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="rounded-lg bg-[#E3432E] px-5 py-2 text-white hover:bg-[#B85C38] transition"
            >
              Login
            </Link>
          ) : isRestaurantAdmin ? (
            <Link
              to="/restaurant-dashboard"
              className="rounded-lg bg-[#E3432E] px-5 py-2 text-white hover:bg-[#B85C38] transition"
            >
              Dashboard
            </Link>
          ) : null}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 text-[#713F2B] hover:text-[#E3432E] transition"
          >
            <span className="text-2xl">🛒</span>
            <span className="font-semibold">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-[#E3432E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

        </div>

        {/* Search, Profile and Buttons */}
        <div className="flex items-center gap-3">

          {/* Search Box */}
          <div className="hidden sm:flex items-center bg-white border border-[#EAE5DA] rounded-full px-4 py-2">
            <span className="text-[#77766F] mr-2">⌕</span>

            <input
              type="text"
              placeholder="Search food..."
              value={search || ""}
              onChange={(e) => setSearch?.(e.target.value)}
              className="w-28 lg:w-36 outline-none text-sm text-[#2D3028] bg-transparent placeholder:text-[#77766F]"
            />
          </div>

          {/* Profile Circle */}
          {isLoggedIn && (
            <Link
              to="/profile"
              title="My Profile"
              className="w-11 h-11 rounded-full bg-[#E3432E] text-white flex items-center justify-center text-lg font-bold border-2 border-[#EAE5DA] hover:bg-[#B85C38] hover:scale-105 transition"
            >
              {profileName.charAt(0).toUpperCase()}
            </Link>
          )}

          {/* Logout / Order Now */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-[#E3432E] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#B85C38] transition whitespace-nowrap"
            >
              Logout
            </button>
          ) : (
            <a
              href="/#menu"
              className="bg-[#E3432E] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#B85C38] transition whitespace-nowrap"
            >
              Order Now →
            </a>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
