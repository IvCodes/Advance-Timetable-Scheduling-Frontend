import { createAsyncThunk } from "@reduxjs/toolkit";
import makeApi from "../../../config/axiosConfig";

const api = makeApi();

export const getUsers = createAsyncThunk(
  "admin/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/all");
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while fetching users.");
    }
  }
);
