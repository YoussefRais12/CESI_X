import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch delivery person by user ID
export const fetchDeliveryPersonByUserId = createAsyncThunk(
  'deliveryPerson/fetchByUserId',
  async (userId, thunkAPI) => {
    const response = await axios.get(`/api/deliveryPerson/user/${userId}`);
    return response.data;
  }
);

// Thunk to update delivery person availability
export const updateDeliveryPersonAvailability = createAsyncThunk(
  'deliveryPerson/updateAvailability',
  async ({ id, available }, thunkAPI) => {
    const response = await axios.put(`/api/deliveryPerson/update/${id}`, { available });
    return response.data;
  }
);

const deliveryPersonSlice = createSlice({
  name: 'deliveryPerson',
  initialState: {
    deliveryPerson: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryPersonByUserId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDeliveryPersonByUserId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.deliveryPerson = action.payload;
      })
      .addCase(fetchDeliveryPersonByUserId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateDeliveryPersonAvailability.fulfilled, (state, action) => {
        if (state.deliveryPerson) {
          state.deliveryPerson.available = action.payload.available;
        }
      });
  },
});

export default deliveryPersonSlice.reducer;
