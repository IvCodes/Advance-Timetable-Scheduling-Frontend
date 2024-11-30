import { createSlice } from '@reduxjs/toolkit';
import {Roles} from '../../assets/constants';
import {loginUser, registerUser, getFaculties,getYears } from './auth.thunks';


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
      logout: (state) => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
      },
      restoreUser: (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(registerUser.pending, (state) => {
          state.loading = true;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
          state.role = action.payload.role || Roles.STUDENT;
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(loginUser.pending, (state) => {
          state.loading = true;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
          state.role = action.payload.role;
        })
        .addCase(loginUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(getFaculties.fulfilled, (state, action) => {
          state.faculties = action.payload;
        })
        .addCase(getYears.fulfilled, (state, action) => {
          state.years = action.payload;
        });
    },
  });


export const { changeRole, logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;