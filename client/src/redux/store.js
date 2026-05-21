import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import appointmentReducer from './slices/appointmentSlice';
import donorReducer from './slices/donorSlice';
import inventoryReducer from './slices/inventorySlice';
import notificationReducer from './slices/notificationSlice';
import requestReducer from './slices/requestSlice';
// New slices
import branchReducer from './slices/branchSlice';
import campReducer from './slices/campSlice';
import staffReducer from './slices/staffSlice';
import transferReducer from './slices/transferSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    appointments: appointmentReducer,
    donors: donorReducer,
    inventory: inventoryReducer,
    notifications: notificationReducer,
    requests: requestReducer,
    // New
    branches: branchReducer,
    camps: campReducer,
    staff: staffReducer,
    transfers: transferReducer,
  },
});

export default store;
