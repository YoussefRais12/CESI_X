import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slice/userSlice";
import restaurantReducer from "./slice/restaurantSlice"; // Add this import



export const store = configureStore({
  reducer: {
    user:userSlice,
    restaurant: restaurantReducer, // Add this line
  },
});
