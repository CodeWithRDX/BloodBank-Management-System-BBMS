import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchStaff = createAsyncThunk('staff/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/staff', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const addStaff = createAsyncThunk('staff/add', async (staffData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/staff', staffData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateStaff = createAsyncThunk('staff/update', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/staff/${id}`, updates);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const removeStaff = createAsyncThunk('staff/remove', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/staff/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const assignBranch = createAsyncThunk('staff/assignBranch', async ({ id, branchId }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/staff/${id}/assign-branch`, { branchId });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    staff: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearStaffError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => { state.loading = true; })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addStaff.fulfilled, (state, action) => { state.staff.unshift(action.payload.data); })
      .addCase(updateStaff.fulfilled, (state, action) => {
        const idx = state.staff.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.staff[idx] = action.payload.data;
      })
      .addCase(removeStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;
