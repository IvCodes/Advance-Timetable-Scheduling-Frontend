import { createSlice } from "@reduxjs/toolkit";
import {
  generateTimetable,
  getTimetable,
  selectAlgorithm,
  getSelectedAlgorithm,
  getNotifications,
  setNotificationRead,
} from "./timetable.api";

const initialState = {
  timetable: [],
  evaluation: null,
  loading: false,
  generating: false,
  error: null,
  llmResponse: null,
  selectedAlgorithm: null,
  notifications: [],
};

const timetableSlice = createSlice({
  name: "timetable",
  initialState: initialState,
  reducers: {
    setTimetable: (state, action) => {
      state.timetable = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setGenerating: (state, action) => {
      state.generating = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateTimetable.pending, (state) => {
        state.generating = true;
      })
      .addCase(generateTimetable.fulfilled, (state, action) => {
        // Leave generating state as true - it will be set to false via SSE
      })
      .addCase(generateTimetable.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })
      .addCase(getTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetable = action.payload.timetables;
        state.evaluation = action.payload.eval;
      })
      .addCase(getTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(selectAlgorithm.pending, (state) => {
        state.loading = true;
      })
      .addCase(selectAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(selectAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSelectedAlgorithm.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSelectedAlgorithm.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAlgorithm = action.payload;
      })
      .addCase(getSelectedAlgorithm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setNotificationRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(setNotificationRead.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(setNotificationRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setTimetable, setLoading, setError, setGenerating } = timetableSlice.actions;
export default timetableSlice.reducer;
