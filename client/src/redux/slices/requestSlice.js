import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchRequests = createAsyncThunk('requests/fetchAll', async (params = '', { rejectWithValue }) => {
  try { const { data } = await API.get(`/requests?${params}`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchMyRequests = createAsyncThunk('requests/myRequests', async (_, { rejectWithValue }) => {
  try { const { data } = await API.get('/requests/my-requests'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createRequest = createAsyncThunk('requests/create', async (reqData, { rejectWithValue }) => {
  try { const { data } = await API.post('/requests', reqData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateRequestStatus = createAsyncThunk('requests/updateStatus', async ({ id, statusData }, { rejectWithValue }) => {
  try { const { data } = await API.put(`/requests/${id}`, statusData); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const requestSlice = createSlice({
  name: 'requests',
  initialState: { requests: [], myRequests: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchRequests.fulfilled, (state, action) => { state.loading = false; state.requests = action.payload.data; state.total = action.payload.total; })
      .addCase(fetchRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyRequests.fulfilled, (state, action) => { state.myRequests = action.payload.data; })
      .addCase(createRequest.fulfilled, (state, action) => { state.myRequests.unshift(action.payload.data); })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const idx = state.requests.findIndex(r => r._id === action.payload.data._id);
        if (idx !== -1) state.requests[idx] = action.payload.data;
      });
  },
});

export default requestSlice.reducer;
