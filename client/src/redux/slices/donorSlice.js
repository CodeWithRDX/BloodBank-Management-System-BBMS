import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchDonors = createAsyncThunk('donors/fetchAll', async (params = '', { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/donors?${params}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchMyDonorProfile = createAsyncThunk('donors/myProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/donors/my-profile');
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateDonor = createAsyncThunk('donors/update', async ({ id, donorData }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/donors/${id}`, donorData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const deleteDonor = createAsyncThunk('donors/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/donors/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchMyDonations = createAsyncThunk('donors/myDonations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/donations/my-donations');
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const donorSlice = createSlice({
  name: 'donors',
  initialState: { donors: [], myProfile: null, myDonations: [], total: 0, loading: false, error: null },
  reducers: { clearDonorError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonors.pending, (state) => { state.loading = true; })
      .addCase(fetchDonors.fulfilled, (state, action) => { state.loading = false; state.donors = action.payload.data; state.total = action.payload.total; })
      .addCase(fetchDonors.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyDonorProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchMyDonorProfile.fulfilled, (state, action) => { state.loading = false; state.myProfile = action.payload.data; })
      .addCase(fetchMyDonorProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyDonations.fulfilled, (state, action) => { state.myDonations = action.payload.data; })
      .addCase(updateDonor.pending, (state) => { state.loading = true; })
      .addCase(updateDonor.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload.data;
        const idx = state.donors.findIndex(d => d._id === action.payload.data._id);
        if (idx !== -1) state.donors[idx] = action.payload.data;
      })
      .addCase(updateDonor.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteDonor.fulfilled, (state, action) => { state.donors = state.donors.filter(d => d._id !== action.payload); });
  },
});

export const { clearDonorError } = donorSlice.actions;
export default donorSlice.reducer;
