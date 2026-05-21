import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/auth/me');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/forgot-password', { email });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/auth/reset-password/${token}`, { password });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    token: token || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loadUser.fulfilled, (state, action) => { state.user = action.payload.data; state.isAuthenticated = true; })
      .addCase(loadUser.rejected, (state) => { state.isAuthenticated = false; state.user = null; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.data; })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
