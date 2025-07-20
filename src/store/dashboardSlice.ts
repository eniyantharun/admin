import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  sidebarOpen: boolean;
  currentPage: string;
}

const initialState: DashboardState = {
  sidebarOpen: true,
  currentPage: 'dashboard',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setCurrentPage } = dashboardSlice.actions;
export default dashboardSlice.reducer;