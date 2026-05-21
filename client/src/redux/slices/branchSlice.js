import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchBranches = createAsyncThunk('branches/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/branches', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch branches');
  }
});

export const fetchPublicBranches = createAsyncThunk('branches/fetchPublic', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/branches/public');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const registerBranch = createAsyncThunk('branches/register', async (branchData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/branches', branchData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const approveBranch = createAsyncThunk('branches/approve', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/branches/${id}/approve`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const rejectBranch = createAsyncThunk('branches/reject', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/branches/${id}/reject`, { rejectionReason: reason });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const updateBranchStatus = createAsyncThunk('branches/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/branches/${id}/status`, { status });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const branchSlice = createSlice({
  name: 'branches',
  initialState: {
    branches: [],
    publicBranches: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearBranchError: (state) => { state.error = null; },
    updateBranchInList: (state, action) => {
      const idx = state.branches.findIndex((b) => b._id === action.payload._id);
      if (idx !== -1) state.branches[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchBranches.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPublicBranches.fulfilled, (state, action) => { state.publicBranches = action.payload.data; })
      .addCase(approveBranch.fulfilled, (state, action) => {
        const idx = state.branches.findIndex((b) => b._id === action.payload.data._id);
        if (idx !== -1) state.branches[idx] = action.payload.data;
      })
      .addCase(rejectBranch.fulfilled, (state, action) => {
        const idx = state.branches.findIndex((b) => b._id === action.payload.data._id);
        if (idx !== -1) state.branches[idx] = action.payload.data;
      });
  },
});

export const { clearBranchError, updateBranchInList } = branchSlice.actions;
export default branchSlice.reducer;
