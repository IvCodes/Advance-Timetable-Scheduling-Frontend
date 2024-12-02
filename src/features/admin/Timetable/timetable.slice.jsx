import { createSlice } from "@reduxjs/toolkit";
import { generateTimetable, getTimetable } from "./timetable.api";

const initialState = {
  timetable: [],
  evaluation: null,
  loading: false,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetable = action.payload;
        state.evaluation = action.payload.eval;
      })
      .addCase(generateTimetable.rejected, (state, action) => {
        state.loading = false;
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
      });
  },
});

export const { setTimetable, setLoading, setError } = timetableSlice.actions;
export default timetableSlice.reducer;
