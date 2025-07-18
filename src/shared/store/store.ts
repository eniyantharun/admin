import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../../features/auth/store/auth.slice';
import { dashboardSlice } from '../../features/dashboard/store/dashboard.slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    dashboard: dashboardSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;