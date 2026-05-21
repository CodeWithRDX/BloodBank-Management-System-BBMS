import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchTransfers = createAsyncThunk('transfers/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/transfers', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const initiateTransfer = createAsyncThunk('transfers/initiate', async (transferData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/transfers', transferData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const acceptTransfer = createAsyncThunk('transfers/accept', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/transfers/${id}/accept`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const rejectTransfer = createAsyncThunk('transfers/reject', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/transfers/${id}/reject`, { rejectionReason: reason });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const transferSlice = createSlice({
  name: 'transfers',
  initialState: {
    transfers: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearTransferError: (state) => { state.error = null; },
    updateTransferInList: (state, action) => {
      const idx = state.transfers.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.transfers[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => { state.loading = true; })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.transfers = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchTransfers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(initiateTransfer.fulfilled, (state, action) => { state.transfers.unshift(action.payload.data); })
      .addCase(acceptTransfer.fulfilled, (state, action) => {
        const idx = state.transfers.findIndex((t) => t._id === action.payload.data._id);
        if (idx !== -1) state.transfers[idx] = action.payload.data;
      })
      .addCase(rejectTransfer.fulfilled, (state, action) => {
        const idx = state.transfers.findIndex((t) => t._id === action.payload.data._id);
        if (idx !== -1) state.transfers[idx] = action.payload.data;
      });
  },
});

export const { clearTransferError, updateTransferInList } = transferSlice.actions;
export default transferSlice.reducer;
