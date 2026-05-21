import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchDashboardStats = createAsyncThunk('admin/stats', async (_, { rejectWithValue }) => {
  try { const { data } = await API.get('/admin/stats'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchUsers = createAsyncThunk('admin/users', async (params = '', { rejectWithValue }) => {
  try { const { data } = await API.get(`/admin/users?${params}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try { await API.delete(`/admin/users/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: { stats: null, users: [], totalUsers: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload.data; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.users = action.payload.data; state.totalUsers = action.payload.total; })
      .addCase(deleteUser.fulfilled, (state, action) => { state.users = state.users.filter(u => u._id !== action.payload); });
  },
});

export default adminSlice.reducer;
