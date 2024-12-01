import { createSlice } from '@reduxjs/toolkit';
import { Roles } from '../../assets/constants';
import {
  loginUser,
  registerUser,
  getFaculties,
  getYears,
  addYear,
  updateYear,
  deleteYear,
  logout as logoutAction
} from './auth.api';



const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  loading: false,
  error: null,
  faculties: [],
  years: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeRole: (state, action) => {
      state.role = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = action.payload.role || Roles.STUDENT;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = action.payload.role || Roles.STUDENT;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout case
      .addCase(logoutAction.fulfilled, (state) => {
        return initialState;
      })
      // Get Faculties cases
      .addCase(getFaculties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload;
        state.error = null;
      })
      .addCase(getFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Years cases
      .addCase(getYears.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getYears.fulfilled, (state, action) => {
        state.loading = false;
        state.years = action.payload;
        state.error = null;
      })
      .addCase(getYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Year cases
      .addCase(addYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addYear.fulfilled, (state, action) => {
        state.loading = false;
        state.years = [...state.years, action.payload];
        state.error = null;
      })
      .addCase(addYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Year cases
      .addCase(updateYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateYear.fulfilled, (state, action) => {
        state.loading = false;
        state.years = state.years.map(year => 
          year.id === action.payload.id ? action.payload : year
        );
        state.error = null;
      })
      .addCase(updateYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Year cases
      .addCase(deleteYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteYear.fulfilled, (state, action) => {
        state.loading = false;
        state.years = state.years.filter(year => year.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { changeRole, clearError, restoreUser } = authSlice.actions;
export default authSlice.reducer;