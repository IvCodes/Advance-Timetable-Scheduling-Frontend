import { createSlice } from "@reduxjs/toolkit";
import {
  generateTimetable,
  getTimetable,
  selectAlgorithm,
  getSelectedAlgorithm,
  getNotifications,
  setNotificationRead,
  publishTimetable,
  getPublishedTimetable,
  getFacultyTimetable,
  getStudentTimetable,
  updateTimetableEntry,
  assignSubstitute,
  removeSubstitute,
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
  publishedTimetable: null,
  facultyTimetable: null,
  studentTimetable: null,
  publishLoading: false,
  updateEntryLoading: false,
  updateEntrySuccess: null,
  substituteLoading: false,
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
    clearUpdateEntrySuccess: (state) => {
      state.updateEntrySuccess = null;
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
      })
      // Published timetable reducers
      .addCase(publishTimetable.pending, (state) => {
        state.publishLoading = true;
      })
      .addCase(publishTimetable.fulfilled, (state, action) => {
        state.publishLoading = false;
      })
      .addCase(publishTimetable.rejected, (state, action) => {
        state.publishLoading = false;
        state.error = action.payload;
      })
      .addCase(getPublishedTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPublishedTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedTimetable = action.payload;
      })
      .addCase(getPublishedTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFacultyTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFacultyTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.facultyTimetable = action.payload;
      })
      .addCase(getFacultyTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getStudentTimetable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStudentTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.studentTimetable = action.payload;
      })
      .addCase(getStudentTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Timetable entry update reducers
      .addCase(updateTimetableEntry.pending, (state) => {
        state.updateEntryLoading = true;
        state.updateEntrySuccess = null;
      })
      .addCase(updateTimetableEntry.fulfilled, (state, action) => {
        state.updateEntryLoading = false;
        state.updateEntrySuccess = {
          type: 'update',
          message: action.payload.message || 'Timetable entry updated successfully'
        };
        
        // Instead of modifying state directly, we'll refetch the data
        // This ensures consistency with the backend
      })
      .addCase(updateTimetableEntry.rejected, (state, action) => {
        state.updateEntryLoading = false;
        state.error = action.payload;
        state.updateEntrySuccess = null;
      })
      // Substitute teacher assignment reducers
      .addCase(assignSubstitute.pending, (state) => {
        state.substituteLoading = true;
        state.updateEntrySuccess = null;
      })
      .addCase(assignSubstitute.fulfilled, (state, action) => {
        state.substituteLoading = false;
        state.updateEntrySuccess = {
          type: 'substitute',
          message: action.payload.message || 'Substitute teacher assigned successfully'
        };
        
        // Update the faculty timetable if we have it in state
        if (state.facultyTimetable && 
            state.facultyTimetable.semesters && 
            action.payload.semester in state.facultyTimetable.semesters) {
          // We'll refetch the data instead of manually updating to ensure consistency
        }
      })
      .addCase(assignSubstitute.rejected, (state, action) => {
        state.substituteLoading = false;
        state.error = action.payload;
        state.updateEntrySuccess = null;
      })
      // Remove substitute teacher reducers
      .addCase(removeSubstitute.pending, (state) => {
        state.substituteLoading = true;
        state.updateEntrySuccess = null;
      })
      .addCase(removeSubstitute.fulfilled, (state, action) => {
        state.substituteLoading = false;
        state.updateEntrySuccess = {
          type: 'remove-substitute',
          message: action.payload.message || 'Substitute teacher removed successfully'
        };
        
        // Update the faculty timetable if we have it in state
        if (state.facultyTimetable && 
            state.facultyTimetable.semesters && 
            action.payload.semester in state.facultyTimetable.semesters) {
          // We'll refetch the data instead of manually updating to ensure consistency
        }
      })
      .addCase(removeSubstitute.rejected, (state, action) => {
        state.substituteLoading = false;
        state.error = action.payload;
        state.updateEntrySuccess = null;
      });
  },
});

export const { 
  setTimetable, 
  setLoading, 
  setError, 
  setGenerating,
  clearUpdateEntrySuccess
} = timetableSlice.actions;

export default timetableSlice.reducer;
