import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchMyAppointments = createAsyncThunk('appointments/my', async (_, { rejectWithValue }) => {
  try { const { data } = await API.get('/appointments/my-appointments'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchAllAppointments = createAsyncThunk('appointments/all', async (params = '', { rejectWithValue }) => {
  try { const { data } = await API.get(`/appointments?${params}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createAppointment = createAsyncThunk('appointments/create', async (aptData, { rejectWithValue }) => {
  try { const { data } = await API.post('/appointments', aptData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const cancelAppointment = createAsyncThunk('appointments/cancel', async (id, { rejectWithValue }) => {
  try { const { data } = await API.put(`/appointments/${id}/cancel`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: { appointments: [], myAppointments: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAppointments.pending, (state) => { state.loading = true; })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => { state.loading = false; state.appointments = action.payload.data; state.total = action.payload.total; })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => { state.myAppointments = action.payload.data; })
      .addCase(createAppointment.fulfilled, (state, action) => { state.myAppointments.unshift(action.payload.data); })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const idx = state.myAppointments.findIndex(a => a._id === action.payload.data._id);
        if (idx !== -1) state.myAppointments[idx] = action.payload.data;
      });
  },
});

export default appointmentSlice.reducer;
