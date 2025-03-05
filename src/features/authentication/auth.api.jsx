import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import makeApi from "./../../config/axiosConfig";

const api = makeApi();

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Registering user with data:", userData);
      
      // Validate data fields
      const requiredFields = ["id", "first_name", "last_name", "username", "email", "password", "role"];
      for (const field of requiredFields) {
        if (!userData[field]) {
          console.error(`Missing required field: ${field}`);
          return rejectWithValue(`Missing required field: ${field}`);
        }
      }
      
      // Add default position for admin users if not specified
      if (userData.role === "admin" && !userData.position) {
        userData.position = "Administrator";
      }
      
      // Ensure ID format is correct
      if (userData.role === "admin" && !userData.id.startsWith("AD")) {
        userData.id = `AD${userData.id.replace(/^[A-Za-z]+/, "")}`;
      } else if (userData.role === "faculty" && !userData.id.startsWith("FA")) {
        userData.id = `FA${userData.id.replace(/^[A-Za-z]+/, "")}`;
      } else if (userData.role === "student" && !userData.id.startsWith("ST")) {
        userData.id = `ST${userData.id.replace(/^[A-Za-z]+/, "")}`;
      }
      
      const response = await api.post(`/users/register`, userData);
      console.log("Registration response:", response.data);
      
      // Save token if provided in response
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role || "student");
      }
      
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error.response || error);
      
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail || error.response.data);
      }
      return rejectWithValue(error.message || "An error occurred while registering.");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Logging in with credentials:", credentials);
      const response = await api.post(`/users/login`, credentials);
      
      console.log("Login response:", response.data);
      
      // Save token and role to localStorage
      if (response.data) {
        // Handle both new and old API response formats
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        } else if (response.data.access_token) {
          localStorage.setItem("token", response.data.access_token);
        } else {
          console.warn("No token found in login response");
          return rejectWithValue("Authentication failed: No token received");
        }
        
        localStorage.setItem("role", response.data.role || "student");
        console.log("Saved token and role to localStorage");
      } else {
        console.warn("Empty response from login API");
        return rejectWithValue("Authentication failed: Empty response");
      }
      
      return response.data;
    } catch (error) {
      console.error("Login failed:", error.response || error);
      
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail || error.response.data);
      }
      return rejectWithValue(error.message || "An error occurred while logging in.");
    }
  }
);

export const getFaculties = createAsyncThunk("auth/getFaculties", async () => {
  try {
    const response = await api.get(`/faculty/faculties`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
});

export const getYears = createAsyncThunk("auth/getYears", async () => {
  try {
    const response = await api.get(`/year/years`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
});

export const addYear = createAsyncThunk("auth/addYear", async (yearData) => {
  try {
    const response = await api.post(`/year/add`, yearData);
    return response.data;
  } catch (error) {
    console.error(error);
  }
});

export const updateYear = createAsyncThunk(
  "auth/updateYear",
  async (yearData) => {
    try {
      const response = await api.put(`/year/update`, yearData);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
);

export const deleteYear = createAsyncThunk(
  "auth/deleteYear",
  async (yearId) => {
    try {
      const response = await api.delete(`/year/delete/${yearId}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
);

export const checkIdExists = createAsyncThunk(
  "auth/checkIdExists",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/check-id-exists/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while checking ID existence.");
    }
  }
);

// export const logout = createAsyncThunk("auth/logout", async () => {
//   try {
//   } catch (error) {
//     console.error(error);
//   }
// });
