
import React, { useState } from "react";

function RestaurantLocation() {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // GET CURRENT GPS LOCATION
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support GPS location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage("Current location detected successfully!");
      },
      () => {
        setMessage("Location permission denied. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // SAVE LOCATION TO BACKEND
  const saveLocation = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!restaurantName.trim() || !restaurantAddress.trim()) {
      setMessage("Please enter restaurant name and address.");
      return;
    }

    if (latitude === "" || longitude === "") {
      setMessage("Please detect your current GPS location first.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("foodieToken");

      const response = await fetch(
        "http://localhost:5000/api/restaurants/location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            restaurantName,
            restaurantAddress,
            latitude,
            longitude,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Restaurant location saved successfully!");
      } else {
        setMessage(data.message || "Unable to save location.");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error. Please check backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#EAE5DA] rounded-2xl p-5 shadow-sm mt-6">
      <h2 className="text-xl font-bold text-[#2D3028]">
        Restaurant Location
      </h2>

      <p className="text-sm text-[#77766F] mt-1 mb-4">
        Save your restaurant's current GPS location for delivery tracking.
      </p>

      <form onSubmit={saveLocation} className="space-y-3">
        <input
          type="text"
          placeholder="Restaurant Name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          className="w-full border border-[#EAE5DA] rounded-xl p-3 outline-none"
        />

        <textarea
          placeholder="Restaurant Address"
          value={restaurantAddress}
          onChange={(e) => setRestaurantAddress(e.target.value)}
          className="w-full border border-[#EAE5DA] rounded-xl p-3 outline-none"
          rows="2"
        />

        <button
          type="button"
          onClick={getCurrentLocation}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
        >
          Get Current GPS Location
        </button>

        {latitude !== "" && longitude !== "" && (
          <p className="text-xs text-[#77766F]">
            Latitude: {latitude}
            <br />
            Longitude: {longitude}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#E3432E] text-white py-3 rounded-xl font-semibold hover:bg-[#c93422] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Restaurant Location"}
        </button>

        {message && (
          <p className="text-sm text-center text-[#2D3028]">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default RestaurantLocation;
