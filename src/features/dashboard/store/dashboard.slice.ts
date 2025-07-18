import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  sidebarOpen: boolean;
  collapsed: boolean;
  currentPage: string;
}

const initialState: DashboardState = {
  sidebarOpen: true,
  collapsed: false,
  currentPage: 'dashboard',
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      if (!state.sidebarOpen) {
        state.sidebarOpen = true;
        state.collapsed = false;
      } else if (!state.collapsed) {
        state.collapsed = true;
      } else {
        state.sidebarOpen = false;
        state.collapsed = false;
      }
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      state.collapsed = !action.payload;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
      if (action.payload) {
        state.sidebarOpen = true;
      }
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setCollapsed, setCurrentPage } = dashboardSlice.actions;