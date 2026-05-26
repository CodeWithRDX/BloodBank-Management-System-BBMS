import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/login', credentials);
    if (!data.twoFactorRequired) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const verify2FAUser = createAsyncThunk('auth/verify2FA', async ({ tempToken, code }, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/verify-2fa', { tempToken, code });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Verification failed');
  }
});

export const loginWithGoogle = createAsyncThunk('auth/google', async (token, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/oauth/google', { token });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

export const loginWithGithub = createAsyncThunk('auth/github', async (code, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/oauth/github', { code });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'GitHub login failed');
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

export const updatePassword = createAsyncThunk('auth/updatePassword', async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/auth/password', { currentPassword, newPassword });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update password');
  }
});

const getUserFromStorage = () => {
  try {
    const val = localStorage.getItem('user');
    if (!val || val === 'undefined') return null;
    return JSON.parse(val);
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return null;
  }
};

const user = getUserFromStorage();
const token = localStorage.getItem('token') === 'undefined' ? null : localStorage.getItem('token');

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
    clearError: (state) => { state.error = null; state.loading = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.twoFactorRequired) {
          state.isAuthenticated = false;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verify2FAUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verify2FAUser.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.token = action.payload.token;
      })
      .addCase(verify2FAUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginWithGoogle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.token = action.payload.token;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginWithGithub.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGithub.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.token = action.payload.token;
      })
      .addCase(loginWithGithub.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload.data));
      })
      .addCase(loadUser.rejected, (state) => { state.isAuthenticated = false; state.user = null; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.data; })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updatePassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(updatePassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
