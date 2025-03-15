import { createAsyncThunk } from "@reduxjs/toolkit";
import makeApi from "../../../config/axiosConfig";

const api = makeApi();

export const generateTimetable = createAsyncThunk(
  "timetable/generate",
  async () => {
    const response = await api.post("/timetable/generate");
    return response.data;
  }
);

export const getTimetable = createAsyncThunk(
  "timetable/timetables",
  async () => {
    const response = await api.get("/timetable/timetables");
    return response.data;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    const response = await api.put('/timetable/notifications/mark-all-read');
    return response.data;
  }
);

export const selectAlgorithm = createAsyncThunk(
  "timetable/select",
  async (algorithm) => {
    const result = await api.post("/timetable/select", { algorithm });
    return result.data;
  }
);

export const getSelectedAlgorithm = createAsyncThunk(
  "timetable/selected",
  async () => {
    const result = await api.get("/timetable/selected");
    console.log("Selected Algorithm:", result.data);
    return result.data;
  }
);

// New functions for the published timetable

export const publishTimetable = createAsyncThunk(
  "timetable/publish",
  async (algorithm) => {
    try {
      const response = await api.post(`/timetable/publish?algorithm=${algorithm}`);
      return response.data;
    } catch (error) {
      console.error("Error publishing timetable:", error);
      throw error;
    }
  }
);

export const getPublishedTimetable = createAsyncThunk(
  "timetable/published",
  async () => {
    try {
      const response = await api.get("/timetable/published");
      return response.data;
    } catch (error) {
      console.error("Error fetching published timetable:", error);
      throw error;
    }
  }
);

export const getFacultyTimetable = createAsyncThunk(
  "timetable/facultyTimetable",
  async (facultyId) => {
    try {
      const response = await api.get(`/timetable/published/faculty/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetable for faculty ${facultyId}:`, error);
      throw error;
    }
  }
);

export const getStudentTimetable = createAsyncThunk(
  "timetable/studentTimetable",
  async (semester) => {
    try {
      const response = await api.get(`/timetable/published/student/${semester}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetable for semester ${semester}:`, error);
      throw error;
    }
  }
);

// New functions for updating timetable entries and handling substitutes

export const updateTimetableEntry = createAsyncThunk(
  "timetable/updateEntry",
  async ({ semester, entryIndex, fields }) => {
    try {
      // Prepare params for the API call - entryIndex and semester are required
      const params = { 
        semester, 
        entry_index: entryIndex,
        ...fields
      };
      
      const response = await api.put("/timetable/published/entry", null, { params });
      return response.data;
    } catch (error) {
      console.error("Error updating timetable entry:", error);
      throw error;
    }
  }
);

export const assignSubstitute = createAsyncThunk(
  "timetable/assignSubstitute",
  async ({ semester, entryIndex, substitute, reason }) => {
    try {
      const params = {
        semester,
        entry_index: entryIndex,
        substitute,
        reason
      };
      
      const response = await api.put("/timetable/published/substitute", null, { params });
      return response.data;
    } catch (error) {
      console.error("Error assigning substitute teacher:", error);
      throw error;
    }
  }
);

export const removeSubstitute = createAsyncThunk(
  "timetable/removeSubstitute",
  async ({ semester, entryIndex }) => {
    try {
      const params = {
        semester,
        entry_index: entryIndex
      };
      
      const response = await api.put("/timetable/published/remove-substitute", null, { params });
      return response.data;
    } catch (error) {
      console.error("Error removing substitute teacher:", error);
      throw error;
    }
  }
);

export const llmResponse = async (scores) => {
  try {
    // Use the new backend endpoint for algorithm evaluation
    const response = await api.post("/timetable/evaluate-algorithms", {
      scores: scores
    });
    
    // The backend will return the analysis from DeepSeek
    return response.data.analysis;
  } catch (error) {
    console.error("Error evaluating algorithms:", error);
    return "Failed to evaluate algorithms. Please try again later.";
  }
};

export const formatScoresForAPI = (evaluation) => {
  // This function is retained for compatibility, but main formatting is now done on the backend
  const formattedScores = {};
  
  // Loop through all algorithms in the evaluation object
  for (const algorithm in evaluation) {
    formattedScores[algorithm] = {};
    // Get the metrics for this algorithm
    const metrics = evaluation[algorithm];
    
    // Format each metric value
    for (const metric in metrics) {
      formattedScores[algorithm][metric] = metrics[metric];
    }
  }
  
  return formattedScores;
};

export const getNotifications = createAsyncThunk(
  "timetable/notifications",
  async () => {
    const response = await api.get("/timetable/notifications");
    return response.data;
  }
);

export const setNotificationRead = createAsyncThunk(
  "timetable/read",
  async (id) => {
    const response = await api.put(`/timetable/notifications/${id}`);
    return response.data;
  }
);

export const editTimetable = createAsyncThunk(
  "timetable/edit",
  async ({ timetableId, timetableData, sessionId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/timetable/timetable/${timetableId}/activity/${sessionId}`,
        timetableData
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      throw error;
    }
  }
);
