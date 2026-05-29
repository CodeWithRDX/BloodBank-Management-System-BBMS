import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await API.get('/notifications'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { const { data } = await API.put(`/notifications/${id}/read`); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { const { data } = await API.put('/notifications/read-all'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const clearNotifications = createAsyncThunk('notifications/clearAll', async (_, { rejectWithValue }) => {
  try { const { data } = await API.delete('/notifications/clear-all'); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.items = action.payload.data; state.unreadCount = action.payload.unreadCount; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex(n => n._id === action.payload.data._id);
        if (idx !== -1) { state.items[idx].isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (state) => { state.items.forEach(n => n.isRead = true); state.unreadCount = 0; })
      .addCase(clearNotifications.fulfilled, (state) => { state.items = []; state.unreadCount = 0; });
  },
});

export default notificationSlice.reducer;
