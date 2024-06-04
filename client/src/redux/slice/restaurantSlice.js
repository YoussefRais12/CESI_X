import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Fetch all restaurants
export const fetchAllRestaurants = createAsyncThunk("restaurant/fetchAllRestaurants", async () => {
  const response = await axios.get("http://localhost:5000/restaurant/all");
  return response.data;
});

// Fetch restaurant by ID
export const fetchRestaurantById = createAsyncThunk("restaurant/fetchRestaurantById", async (id) => {
  const response = await axios.get(`http://localhost:5000/restaurant/${id}`);
  return response.data;
});

// Fetch restaurants by owner ID
export const fetchRestaurantsByOwnerId = createAsyncThunk("restaurant/fetchRestaurantsByOwnerId", async (ownerId) => {
  const response = await axios.get(`http://localhost:5000/restaurant/owner/${ownerId}`);
  return response.data;
});

// Add new restaurant
export const addRestaurant = createAsyncThunk("restaurant/addRestaurant", async (newRestaurant) => {
  try {
    let result = await axios.post("http://localhost:5000/restaurant/register", newRestaurant, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Update restaurant
export const updateRestaurant = createAsyncThunk("restaurant/updateRestaurant", async (data) => {
  try {
    let result = await axios.put(`http://localhost:5000/restaurant/${data.id}`, data, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Delete restaurant
export const deleteRestaurant = createAsyncThunk("restaurant/deleteRestaurant", async (id) => {
  try {
    await axios.delete(`http://localhost:5000/restaurant/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return id;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Fetch all articles for a specific restaurant
export const fetchArticlesByRestaurantId = createAsyncThunk("restaurant/fetchArticlesByRestaurantId", async (restaurantId) => {
  try {
    let result = await axios.get(`http://localhost:5000/restaurant/${restaurantId}/articles`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Fetch all menus for a specific restaurant
export const fetchMenusByRestaurantId = createAsyncThunk("restaurant/fetchMenusByRestaurantId", async (restaurantId) => {
  try {
    let result = await axios.get(`http://localhost:5000/restaurant/${restaurantId}/menus`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Upload restaurant image
export const uploadRestaurantImage = createAsyncThunk("restaurant/uploadImage", async ({ id, formData }) => {
  try {
      let result = await axios.post(`http://localhost:5000/restaurant/upload-image/${id}`, formData, {
          headers: {
              Authorization: localStorage.getItem("token"),
              "Content-Type": "multipart/form-data"
          },
      });
      return result.data.restaurant;
  } catch (error) {
      console.log(error);
      throw error;
  }
});

const initialState = {
  restaurants: [],
  restaurant: null,
  ownedRestaurants: [],
  articles: [],
  menus: [],
  status: null,
  error: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRestaurants.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.restaurants = action.payload;
      })
      .addCase(fetchAllRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchRestaurantById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.restaurant = action.payload;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchRestaurantsByOwnerId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRestaurantsByOwnerId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ownedRestaurants = action.payload;
      })
      .addCase(fetchRestaurantsByOwnerId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.restaurants.push(action.payload);
      })
      .addCase(addRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.restaurants.findIndex((restaurant) => restaurant._id === action.payload._id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.restaurants = state.restaurants.filter((restaurant) => restaurant._id !== action.payload);
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchArticlesByRestaurantId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchArticlesByRestaurantId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.articles = action.payload;
      })
      .addCase(fetchArticlesByRestaurantId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchMenusByRestaurantId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenusByRestaurantId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.menus = action.payload;
      })
      .addCase(fetchMenusByRestaurantId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(uploadRestaurantImage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadRestaurantImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.restaurants.findIndex((restaurant) => restaurant._id === action.payload._id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
      })
      .addCase(uploadRestaurantImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default restaurantSlice.reducer;
