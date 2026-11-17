
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;

    if (!name || !email || !phone || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setMessage("Please enter a valid 10 digit phone number.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(true);
      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      if (
        error.name === "TimeoutError" ||
        error.name === "AbortError"
      ) {
        setMessage("Request timed out. Please check your backend.");
      } else if (error instanceof TypeError) {
        setMessage("Cannot connect to backend server.");
      } else {
        setMessage(error.message || "Something went wrong.");
      }
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
            Create Account
          </h2>

          <p className="mt-2 text-gray-600">
            Join Foodie for delicious food!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block mb-2 font-medium text-[#2D3028]">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              disabled={loading}
              className="w-full rounded-lg border border-[#E8D4C2] px-4 py-3 outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-[#2D3028]">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={loading}
              className="w-full rounded-lg border border-[#E8D4C2] px-4 py-3 outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 disabled:bg-gray-100"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block mb-2 font-medium text-[#2D3028]">
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10 digit phone number"
              autoComplete="tel"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]{10}"
              required
              disabled={loading}
              className="w-full rounded-lg border border-[#E8D4C2] px-4 py-3 outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-2 font-medium text-[#2D3028]">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={loading}
              className="w-full rounded-lg border border-[#E8D4C2] px-4 py-3 outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 disabled:bg-gray-100"
            />
          </div>

          {/* Message */}
          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm ${
                success ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#E3432E] py-3 font-semibold text-white transition hover:bg-[#B85C38] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#E3432E] hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
