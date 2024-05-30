import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Fetch all articles
export const fetchAllArticles = createAsyncThunk("article/fetchAllArticles", async () => {
    const response = await axios.get("http://localhost:5000/article/all");
    return response.data;
});

// Fetch article by ID
export const fetchArticleById = createAsyncThunk("article/fetchArticleById", async (id) => {
    const response = await axios.get(`http://localhost:5000/article/${id}`);
    return response.data;
});

// Add new article
export const addArticle = createAsyncThunk("article/addArticle", async (newArticle) => {
    try {
        let result = await axios.post("http://localhost:5000/article/add", newArticle, {
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

// Update article
export const updateArticle = createAsyncThunk("article/updateArticle", async ({ id, articleData }) => {
    try {
        let result = await axios.put(`http://localhost:5000/article/${id}`, articleData, {
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

// Delete article
export const deleteArticle = createAsyncThunk("article/deleteArticle", async (id) => {
    try {
        await axios.delete(`http://localhost:5000/article/${id}`, {
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
    articles: [],
    article: null,
    status: null,
    error: null,
};

const articleSlice = createSlice({
    name: "article",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllArticles.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllArticles.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.articles = action.payload;
            })
            .addCase(fetchAllArticles.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchArticleById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchArticleById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.article = action.payload;
            })
            .addCase(fetchArticleById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(addArticle.pending, (state) => {
                state.status = "loading";
            })
            .addCase(addArticle.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.articles.push(action.payload);
            })
            .addCase(addArticle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(updateArticle.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateArticle.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.articles.findIndex((article) => article._id === action.payload._id);
                if (index !== -1) {
                    state.articles[index] = action.payload;
                }
            })
            .addCase(updateArticle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(deleteArticle.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteArticle.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.articles = state.articles.filter((article) => article._id !== action.payload);
            })
            .addCase(deleteArticle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export default articleSlice.reducer;
