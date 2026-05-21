import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchCamps = createAsyncThunk('camps/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/camps', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchCamp = createAsyncThunk('camps/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/camps/${id}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createCamp = createAsyncThunk('camps/create', async (campData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/camps', campData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateCamp = createAsyncThunk('camps/update', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/camps/${id}`, updates);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const cancelCamp = createAsyncThunk('camps/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/camps/${id}/cancel`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const registerForCamp = createAsyncThunk('camps/register', async (campId, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/camps/${campId}/register`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchNearbyCamps = createAsyncThunk('camps/fetchNearby', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/geo/camps', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchMyRegistrations = createAsyncThunk('camps/myRegistrations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/camps/my-registrations');
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchCampRegistrations = createAsyncThunk('camps/registrations', async (campId, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/camps/${campId}/registrations`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchAllRegistrations = createAsyncThunk('camps/fetchAllRegistrations', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/camps/registrations/all', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});


export const updateRegistrationStatus = createAsyncThunk('camps/updateRegistrationStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/camps/registrations/${id}/status`, { status });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const campSlice = createSlice({
  name: 'camps',
  initialState: {
    camps: [],
    currentCamp: null,
    registrations: [],
    allRegistrations: [],
    myRegistrations: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCampError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCamps.pending, (state) => { state.loading = true; })
      .addCase(fetchCamps.fulfilled, (state, action) => {
        state.loading = false;
        state.camps = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchCamps.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchNearbyCamps.pending, (state) => { state.loading = true; })
      .addCase(fetchNearbyCamps.fulfilled, (state, action) => {
        state.loading = false;
        state.camps = action.payload.data;
        state.total = action.payload.data.length;
      })
      .addCase(fetchNearbyCamps.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCamp.fulfilled, (state, action) => { state.currentCamp = action.payload.data; })
      .addCase(createCamp.fulfilled, (state, action) => { state.camps.unshift(action.payload.data); })
      .addCase(cancelCamp.fulfilled, (state, action) => {
        const idx = state.camps.findIndex((c) => c._id === action.payload.data._id);
        if (idx !== -1) state.camps[idx] = action.payload.data;
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => { state.myRegistrations = action.payload.data; })
      .addCase(fetchCampRegistrations.fulfilled, (state, action) => { state.registrations = action.payload.data; })
      .addCase(fetchAllRegistrations.pending, (state) => { state.loading = true; })
      .addCase(fetchAllRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.allRegistrations = action.payload.data || [];
      })
      .addCase(fetchAllRegistrations.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateRegistrationStatus.fulfilled, (state, action) => {
        const idx = state.registrations.findIndex((r) => r._id === action.payload.data._id);
        if (idx !== -1) state.registrations[idx] = action.payload.data;
        const allIdx = state.allRegistrations.findIndex((r) => r._id === action.payload.data._id);
        if (allIdx !== -1) state.allRegistrations[allIdx] = action.payload.data;
      });
  },
});

export const { clearCampError } = campSlice.actions;
export default campSlice.reducer;
