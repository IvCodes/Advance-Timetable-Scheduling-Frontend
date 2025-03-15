import { createSlice } from "@reduxjs/toolkit";
import { Roles } from "../../assets/constants";
import { loginUser, registerUser, getFaculties, getYears } from "./auth.api";
import {
  addFaculty,
  updateFaculties,
  deleteFaculties,
} from "../admin/DataManagement/data.api";

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
      const { token, role, user } = action.payload;
      
      console.log("Restoring user session with token:", token);
      console.log("User role:", role);
      
      if (token && role) {
        state.isAuthenticated = true;
        state.role = role;
        state.user = user || { role };
        
        console.log("User session restored successfully");
      } else {
        console.warn("Cannot restore user session - missing token or role");
        state.isAuthenticated = false;
        state.role = null;
        state.user = null;
      }
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
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = action.payload.role || Roles.STUDENT;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(getFaculties.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload;
      })
      .addCase(getFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getYears.pending, (state) => {
        state.loading = true;
      })
      .addCase(getYears.fulfilled, (state, action) => {
        state.loading = false;
        state.years = action.payload;
      })
      .addCase(getYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFaculty.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFaculty.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties.push(action.payload);
      })
      .addCase(addFaculty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFaculties.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload;
      })
      .addCase(updateFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFaculties.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload;
      })
      .addCase(deleteFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { changeRole, logout, restoreUser } = authSlice.actions;
export default authSlice.reducer;
