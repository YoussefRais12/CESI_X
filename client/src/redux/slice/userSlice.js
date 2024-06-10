// userSlice.js
import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Fetch all users
export const fetchAllUsers = createAsyncThunk("user/fetchAllUsers", async () => {
  try {
    let result = await axios.get("http://localhost:5000/user/all", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data.users;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Fetch user by ID
export const fetchUserById = createAsyncThunk("user/fetchUserById", async (userId) => {
  try {
    let result = await axios.get(`http://localhost:5000/user/find/${userId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data.users;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Fetch user logs
export const fetchUserLogs = createAsyncThunk("user/fetchUserLogs", async (userId) => {
  try {
    let result = await axios.get(`http://localhost:5000/user/logs/${userId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data.logs;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Edit user role
export const userEdit = createAsyncThunk("user/update", async (data) => {
  try {
    let result = await axios.put(`http://localhost:5000/user/update/${data.id}`, data, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data.newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Delete user
export const userDelete = createAsyncThunk("user/delete", async (userId) => {
  try {
    await axios.delete(`http://localhost:5000/user/delete/${userId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return userId;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Add new user
export const userAdd = createAsyncThunk("user/add", async (newUser) => {
  try {
    let result = await axios.post("http://localhost:5000/user/add", newUser, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data.result;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Register user
export const userRegister = createAsyncThunk("user/register", async (newUser) => {
  try {
    let result = await axios.post("http://localhost:5000/user/register", newUser);
    return result.data.user;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Login user
export const userLogin = createAsyncThunk("user/login", async (user) => {
  try {
    let result = await axios.post("http://localhost:5000/user/login", user);
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

// Get current user
export const userCurrent = createAsyncThunk("user/current", async () => {
  try {
    let result = await axios.get("http://localhost:5000/user/current", {
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

// Upload user image
export const uploadUserImage = createAsyncThunk("user/uploadImage", async (formData) => {
  try {
    let result = await axios.post("http://localhost:5000/user/upload-image", formData, {
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-Type": "multipart/form-data",
      },
    });
    return result.data.user;
  } catch (error) {
    console.log(error);
    throw error;
  }
});

const initialState = {
  user: null,
  users: [],
  selectedUser: null,
  logs: [],
  status: null,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // login extra reducers
      .addCase(userLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        if (action.payload && action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          localStorage.setItem("token", action.payload.token);
        } else {
          console.error("Invalid payload structure:", action.payload);
          state.error = "Invalid login response structure";
        }
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // current user cases
      .addCase(userCurrent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(userCurrent.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.user = action.payload?.user;
      })
      .addCase(userCurrent.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // fetch all users cases
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // fetch user by ID cases
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // fetch user logs cases
      .addCase(fetchUserLogs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserLogs.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.logs = action.payload;
      })
      .addCase(fetchUserLogs.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // user edit cases
      .addCase(userEdit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(userEdit.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        const updatedUserIndex = state.users.findIndex(user => user._id === action.payload._id);
        if (updatedUserIndex >= 0) {
          state.users[updatedUserIndex] = action.payload;
        }
      })
      .addCase(userEdit.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // user delete cases
      .addCase(userDelete.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(userDelete.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(userDelete.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // user add cases
      .addCase(userAdd.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(userAdd.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.users.push(action.payload);
      })
      .addCase(userAdd.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      })
      // upload user image cases
      .addCase(uploadUserImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadUserImage.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.user = { ...state.user, img: action.payload.img };
      })
      .addCase(uploadUserImage.rejected, (state, action) => {
        state.status = "fail";
        state.error = action.error.message;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
