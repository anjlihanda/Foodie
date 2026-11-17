
require("dotenv").config();

const mongoose = require("mongoose");
const Food = require("./models/food");
const User = require("./models/user");

// Original Foodie food list
const categories = [
  ["Burger", [
    ["Veg Burger", 59],
    ["Cheese Burger", 99],
    ["Aloo Tikki Burger", 79],
    ["Double Patty Burger", 139],
  ]],
  ["Pizza", [
    ["Margherita Pizza", 149],
    ["Farmhouse Pizza", 229],
    ["Cheese Burst Pizza", 249],
    ["Corn Pizza", 179],
    ["Veg Supreme Pizza", 259],
  ]],
  ["Pasta", [
    ["White Sauce Pasta", 159],
    ["Penne Pasta", 169],
    ["Veg Alfredo Pasta", 189],
  ]],
  ["Sandwich", [
    ["Veg Sandwich", 69],
    ["Cheese Sandwich", 89],
    ["Grilled Sandwich", 99],
    ["Club Sandwich", 129],
    ["Paneer Sandwich", 119],
  ]],
  ["Momos", [
    ["Veg Momos", 79],
    ["Fried Momos", 89],
    ["noodles", 119],
    ["Paneer Momos", 109],
    ["Cheese Momos", 119],
    ["Chilli Momos", 129],
  ]],
  ["SpringRoll", [
    ["Veg Spring Rolls", 89],
    ["Crispy Spring Rolls", 109],
  ]],
  ["roti", [
    ["sabji roti", 100],
    ["Masla panir", 149],
  ]],
  ["CholeBhature", [
    ["Punjabi Chole Plate", 119],
  ]],
  ["Noodles", [
    ["Veg Hakka Noodles", 109],
  ]],
  ["Maggi", [
    ["Classic Maggi", 49],
    ["Cheese Maggi", 79],  
  ]],
  ["Indian", [
    ["Masala Dosa", 89],
    ["Aloo Paratha", 49],
    ["Dal Makhani", 149],
  ]],
  ["Rice", [
    ["Veg Biryani", 129],
    ["Paneer Biryani", 159],
    ["Fried Rice", 109],
    ["Jeera Rice", 99],
    ["Schezwan Rice", 129],
    ["Lemon Rice", 109],
  ]],
  ["smosa", [
    ["smosa", 15],
  ]],
  ["Paneer", [
    ["Matar Paneer", 169],
    ["Paneer Lababdar", 199],
    ["Shahi Paneer", 189],
    ["Kadai Paneer", 199],
    ["Paneer Butter Masala", 199],
  ]],
  ["Sabzi", [
    ["Mix Veg", 139],
    ["Dum Aloo", 149],
    ["Mushroom Masala", 169],
  ]],
  ["Snacks", [
    ["French Fries", 59],
    ["Peri Peri Fries", 79],
    ["Cheese Garlic Bread", 99],
    ["Veg Nuggets", 89],
    ["Crispy Corn", 119],
  ]],
  ["Cake", [
    ["Chocolate Cake", 99],
    ["Black Forest Cake", 119],
    ["Red Velvet Cake", 129],
    ["Vanilla Cake", 99],
    ["Butterscotch Cake", 119],
  ]],
  ["Chocolate", [
    ["Chocolate Fudge", 99],
    ["Chocolate Cupcake", 69],
  ]],
  ["IceCream", [
    ["Mango Ice Cream", 59],
  ]],
  ["Dessert", [
    ["Brownie", 79],
    ["Cheesecake", 129],
    ["Chocolate Pudding", 89],
  ]],
  ["Juice", [
    ["Orange Juice", 69],
    ["choklate Juice", 69],
  ]],
  ["ColdDrink", [
    ["Lemon Soda", 49],
    ["Coca Cola", 40],
    ["Orange Drink", 60],
  ]],
  ["Shakes", [
    ["Oreo Shake", 119],
    ["Cold Coffee", 79],
    ["Chocolate Shake", 109],
    ["KitKat Shake", 129],
    ["Mango Shake", 99],
  ]],
  ["Drinks", [
    ["Iced Coffee", 79],
    ["Lemon Iced Tea", 69],
  ]],
];

// Category-wise food images
const images = {
  Burger: "photo-1568901346375-23c9450c58cd",
  Pizza: "photo-1513104890138-7c749659a591",
  Pasta: "photo-1473093295043-cdd812d0e601",
  Sandwich: "photo-1528735602780-2552fd46c7af",
  Momos: "photo-1563245372-f21724e3856d",
  SpringRoll: "photo-1573080496219-bb080dd4f877",
  roti: "photo-1546833999-b9f581a1996d",
  CholeBhature: "photo-1626132647523-66f5bf380027",
  Noodles: "photo-1569718212165-3a8278d5f624",
  Maggi: "photo-1569718212165-3a8278d5f624",
  Indian: "photo-1626132647523-66f5bf380027",
  Rice: "photo-1633945274405-b6c8069047b0",
  smosa: "photo-1601050690597-df0568f70950",
  Paneer: "photo-1631452180519-c014fe946bc7",
  Sabzi: "photo-1585937421612-70a008356fbe",
  Snacks: "photo-1573080496219-bb080dd4f877",
  Cake: "photo-1578985545062-69928b1d9587",
  Chocolate: "photo-1606313564200-e75d5e30476c",
  IceCream: "photo-1563805042-7684c019e1cb",
  Dessert: "photo-1578985545062-69928b1d9587",
  Juice: "photo-1613478223719-2ab802602423",
  ColdDrink: "photo-1544145945-f90425340c7e",
  Shakes: "photo-1572490122747-3968b75cc699",
  Drinks: "photo-1461023058943-07fcbe16d735",
};

async function seedFoods() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const adminEmail = process.env.RESTAURANT_ADMIN_EMAIL;

    if (!mongoUri || !adminEmail) {
      throw new Error(
        "MONGO_URI or RESTAURANT_ADMIN_EMAIL missing in .env"
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected!");

    const admin = await User.findOne({
      email: adminEmail.trim().toLowerCase(),
      role: "restaurantAdmin",
    });

    if (!admin) {
      throw new Error(
        "Restaurant Admin not found. Check RESTAURANT_ADMIN_EMAIL and role."
      );
    }

    const foods = categories.flatMap(([category, items]) =>
      items.map(([name, price]) => ({
        name,
        price,
        category,
        image: images[category] || images.Snacks,
        restaurant: admin._id,
      }))
    );

    const operations = foods.map((food) => ({
      updateOne: {
        filter: {
          restaurant: admin._id,
          name: food.name,
        },
        update: {
          $setOnInsert: food,
        },
        upsert: true,
      },
    }));

    const result = await Food.bulkWrite(operations);

    console.log("Food items processed:", foods.length);
    console.log("New food items added:", result.upsertedCount);
    console.log("Food seeding completed successfully!");

  } catch (error) {
    console.error("Seeding Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected.");
  }
}

seedFoods();
