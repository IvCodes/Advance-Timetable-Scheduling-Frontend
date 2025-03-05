import { createSlice } from "@reduxjs/toolkit";
import {
  getUniInfo,
  updateUniInfo,
  addDay,
  getDays,
  getPeriods,
  getSubjects,
  addSubjects,
  updateSubjects,
  deleteSubjects,
  getTeachers,
  getSpaces,
  addSpace,
  updateSpace,
  deleteSpace,
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "./data.api";

const initialState = {
  uniInfo: null,
  days: [],
  periods: [],
  subjects: [],
  teachers: [],
  spaces: [],
  activities: [],
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUniInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUniInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.uniInfo = action.payload;
      })
      .addCase(getUniInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUniInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUniInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.uniInfo = action.payload;
      })
      .addCase(updateUniInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDays.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDays.fulfilled, (state, action) => {
        state.loading = false;
        state.days = [];
        for (let i = 0; i < action.payload?.length; i++) {
          state.days.push({ ...action.payload[i], key: i });
        }
      })
      .addCase(getDays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addDay.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDay.fulfilled, (state, action) => {
        state.loading = false;
        state.days = action.payload;
      })
      .addCase(addDay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPeriods.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPeriods.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = action.payload;
      })
      .addCase(getPeriods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(getSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSubjects.fulfilled, (state, action) => {
        state.loading = false;
        // state.subjects = action.payload;
      })
      .addCase(addSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubjects.fulfilled, (state, action) => {
        state.loading = false;
        // state.subjects = action.payload;
      })
      .addCase(updateSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSubjects.fulfilled, (state, action) => {
        state.loading = false;
        // state.subjects = action.payload;
      })
      .addCase(deleteSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTeachers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(getTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSpaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSpaces.fulfilled, (state, action) => {
        state.loading = false;
        state.spaces = action.payload;
      })
      .addCase(getSpaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSpace.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSpace.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSpace.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSpace.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSpace.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSpace.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteSpace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(getActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(addActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(addActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dataSlice.reducer;
