import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const apiUrl = process.env.REACT_APP_API_URL;

// Fetch all menus for a restaurant
export const fetchMenusByRestaurantId = createAsyncThunk("menu/fetchMenusByRestaurantId", async (restaurantId) => {
    const response = await axios.get(`${apiUrl}/menu/restaurant/${restaurantId}`);
    return response.data;
});

// Fetch menu by ID
export const fetchMenuById = createAsyncThunk("menu/fetchMenuById", async (id) => {
    const response = await axios.get(`${apiUrl}/menu/${id}`);
    return response.data;
});

// Add new menu
export const createMenu = createAsyncThunk("menu/createMenu", async (newMenu) => {
    try {
        const apiurl = process.env.REACT_APP_API_URL;
        let result = await axios.post("${apiUrl}/menu/", newMenu, {
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

// Update menu
export const updateMenu = createAsyncThunk("menu/updateMenu", async ({ id, menuData }) => {
    try {
        let result = await axios.put(`${apiUrl}/menu/${id}`, menuData, {
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

// Delete menu
export const deleteMenu = createAsyncThunk("menu/deleteMenu", async (id) => {
    try {
        await axios.delete(`${apiUrl}/menu/${id}`, {
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

const initialState = {
    menus: [],
    menu: null,
    status: null,
    error: null,
};

const menuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            .addCase(fetchMenuById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMenuById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.menu = action.payload;
            })
            .addCase(fetchMenuById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(createMenu.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createMenu.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.menus.push(action.payload);
            })
            .addCase(createMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(updateMenu.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateMenu.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.menus.findIndex((menu) => menu.id === action.payload.id);
                if (index !== -1) {
                    state.menus[index] = action.payload;
                }
            })
            .addCase(updateMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(deleteMenu.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteMenu.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.menus = state.menus.filter((menu) => menu.id !== action.payload);
            })
            .addCase(deleteMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export default menuSlice.reducer;
