import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://foodie-1-ck6c.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Check login response
      if (!data.token || !data.user) {
        throw new Error("User information not received from server");
      }

      // Clear previous login information
      localStorage.removeItem("foodieToken");
      localStorage.removeItem("foodieUser");

      // Save current logged-in user
      localStorage.setItem("foodieToken", data.token);

      localStorage.setItem(
        "foodieUser",
        JSON.stringify(data.user)
      );

      console.log("Logged in user:", data.user);
      console.log("User role:", data.user.role);

      setMessage("Login successful!");

      // Redirect according to user role
      if (data.user.role === "restaurantAdmin") {
        navigate("/restaurant-dashboard");
      } 
      else if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } 
      else {
        navigate("/");
      }

    } catch (error) {
      setMessage(
        error.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-[#E8D4C2]">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-[#B85C38]">
            Foodie<span className="text-[#D99A5B]">.</span>
          </h1>

          <h2 className="mt-5 text-2xl font-bold text-[#2D3028]">
            Welcome Back!
          </h2>

          <p className="mt-2 text-gray-600">
            Login to your Foodie account
          </p>

        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>

            <label
              htmlFor="email"
              className="block mb-2 font-medium text-[#2D3028]"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-[#E8D4C2] px-4 py-3 outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20"
            />

          </div>

          <div>

            <label
              htmlFor="password"
              className="block mb-2 font-medium text-[#2D3028]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-[#E8D4C2] px-4 py-3 outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20"
            />

          </div>

          {message && (
            <p
              role="status"
              className={`text-sm ${
                message === "Login successful!"
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#E3432E] py-3 font-semibold text-white transition hover:bg-[#B85C38] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-semibold text-[#E3432E] hover:underline"
          >
            Register
          </Link>

        </p>

        <p className="mt-6 text-center text-sm text-gray-600">
          Fresh Food, Fast Delivery!
        </p>

      </div>
    </div>
  );
}

export default Login;
