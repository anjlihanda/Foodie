
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ADD FOOD
  const addToCart = (food) => {
    setCart((prevCart) => {

      const existing = prevCart.find(
        (item) => item._id === food._id
      );

      // Check restaurant only when both foods have restaurant IDs
      const getRestaurantId = (restaurant) => {
        if (!restaurant) return null;

        return typeof restaurant === "object"
          ? restaurant._id?.toString()
          : restaurant.toString();
      };

      if (prevCart.length > 0) {
        const oldRestaurant = getRestaurantId(
          prevCart[0].restaurant
        );

        const newRestaurant = getRestaurantId(
          food.restaurant
        );

        if (
          oldRestaurant &&
          newRestaurant &&
          oldRestaurant !== newRestaurant
        ) {
          alert("Please order from one restaurant at a time.");
          return prevCart;
        }
      }

      // Increase quantity if food already exists
      if (existing) {
        return prevCart.map((item) =>
          item._id === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new food
      return [
        ...prevCart,
        { ...food, quantity: 1 }
      ];
    });
  };

  // UPDATE QUANTITY
  const updateQuantity = (foodId, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item._id === foodId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // REMOVE FOOD
  const removeFromCart = (foodId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item._id !== foodId)
    );
  };

  // CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

  // TOTAL
  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // ITEM COUNT
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
