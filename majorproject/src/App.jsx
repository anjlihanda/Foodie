
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Services from "./components/Servics";
import Menu from "./components/Menu";
import Footer from "./components/Fotter";
import Login from "./components/Login";
import Register from "./components/Register";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Profile from "./components/Profile";
import Myorder from "./components/Myorder";
import PreviousOrders from "./components/PreviousOrders";
import ResturentAdmin from "./components/ResturentAdmin";
import OfferSlider from "./components/OfferSlider";

const HomePage = () => {
  const [search, setSearch] = useState("");

  return (
    <>
      <Navbar search={search} setSearch={setSearch} />
      <Home />
      <About />
      <Services />
      <OfferSlider />
      <Menu search={search} setSearch={setSearch} />
      <Footer />
    </>
  );
};

// PROFILE ROUTE
const ProfileRoute = () => {
  const user = JSON.parse(
    localStorage.getItem("foodieUser") || "null"
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "restaurantAdmin") {
    return <Navigate to="/restaurant-dashboard" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <Profile />
      <Footer />
    </>
  );
};

// RESTAURANT ADMIN ROUTE
const RestaurantRoute = () => {
  const user = JSON.parse(
    localStorage.getItem("foodieUser") || "null"
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "restaurantAdmin") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <>
      <Navbar />
      <ResturentAdmin />
      <Footer />
    </>
  );
};

// CUSTOMER ROUTE PROTECTION
const CustomerRoute = ({ children }) => {
  const user = JSON.parse(
    localStorage.getItem("foodieUser") || "null"
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "customer") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

// MAIN APP
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          }
        />

        <Route
          path="/register"
          element={
            <>
              <Navbar />
              <Register />
              <Footer />
            </>
          }
        />

        <Route
          path="/cart"
          element={
            <>
              <Navbar />
              <Cart />
              <Footer />
            </>
          }
        />

        <Route
          path="/checkout"
          element={
            <>
              <Navbar />
              <Checkout />
              <Footer />
            </>
          }
        />

        <Route path="/profile" element={<ProfileRoute />} />

        <Route
          path="/my-orders"
          element={
            <CustomerRoute>
              <Myorder />
            </CustomerRoute>
          }
        />

        <Route
          path="/previous-orders"
          element={
            <CustomerRoute>
              <PreviousOrders />
            </CustomerRoute>
          }
        />

        <Route
          path="/restaurant-dashboard"
          element={<RestaurantRoute />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
