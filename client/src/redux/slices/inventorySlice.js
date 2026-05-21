import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchInventory = createAsyncThunk('inventory/fetchAll', async (params = '', { rejectWithValue }) => {
  try { const { data } = await API.get(`/inventory?${params}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchInventorySummary = createAsyncThunk('inventory/summary', async (_, { rejectWithValue }) => {
  try { const { data } = await API.get('/inventory/summary'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const addInventoryItem = createAsyncThunk('inventory/add', async (itemData, { rejectWithValue }) => {
  try { const { data } = await API.post('/inventory', itemData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateInventoryItem = createAsyncThunk('inventory/update', async ({ id, itemData }, { rejectWithValue }) => {
  try { const { data } = await API.put(`/inventory/${id}`, itemData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { items: [], summary: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; })
      .addCase(fetchInventory.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; state.total = action.payload.total; })
      .addCase(fetchInventory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchInventorySummary.pending, (state) => { state.loading = true; })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload.data; })
      .addCase(addInventoryItem.fulfilled, (state, action) => { state.items.unshift(action.payload.data); state.total += 1; })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i._id === action.payload.data._id);
        if (idx !== -1) state.items[idx] = action.payload.data;
      });
  },
});

export default inventorySlice.reducer;
