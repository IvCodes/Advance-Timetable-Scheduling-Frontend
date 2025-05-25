import { createAsyncThunk } from "@reduxjs/toolkit";
import makeApi from "../../../config/axiosConfig";

const api = makeApi();

export const getTeacherAllocationReport = createAsyncThunk(
  "dashboard/teacherAllocation",
  async () => {
    try {
      const response = await api.get("/dashboard/teacher-allocation");
      return response.data;
    } catch (error) {
      console.error("Error fetching teacher allocation report:", error);
      throw error;
    }
  }
);

export const getSpaceOccupancyReport = createAsyncThunk(
  "dashboard/spaceOccupancy", 
  async () => {
    try {
      const response = await api.get("/dashboard/space-occupancy");
      return response.data;
    } catch (error) {
      console.error("Error fetching space occupancy report:", error);
      throw error;
    }
  }
); 