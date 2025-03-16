import { createAsyncThunk } from "@reduxjs/toolkit";
import makeApi from "../../../config/axiosConfig";
import { getFaculties } from "./../../authentication/auth.api";

const api = makeApi();

export const getUniInfo = createAsyncThunk("data/getUniInfo", async () => {
  try {
    const response = await api.get(`/info/university`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data.detail;
    }
  }
});

export const updateUniInfo = createAsyncThunk(
  "data/updateUniInfo",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/info/university`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue(
        "An error occurred while updating university info."
      );
    }
  }
);

export const getDays = createAsyncThunk("data/getDays", async () => {
  try {
    const response = await api.get(`/info/days`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data.detail;
    }
  }
});

export const addDay = createAsyncThunk(
  "data/addDay",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/info/days`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while adding the day.");
    }
  }
);

export const getPeriods = createAsyncThunk(
  "data/getPeriods",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/info/periods`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while getting the periods.");
    }
  }
);

export const updatePeriods = createAsyncThunk(
  "data/updatePeriods",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/info/periods`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while updating the periods.");
    }
  }
);

export const addFaculty = createAsyncThunk(
  "data/addFaculty",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/faculty/faculties`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while adding the faculty.");
    }
  }
);

export const updateFaculties = createAsyncThunk(
  "data/updateFaculties",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/faculty/faculties/${data.code}`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while updating the faculties.");
    }
  }
);

export const deleteFaculties = createAsyncThunk(
  "data/deleteFaculties",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/faculty/faculties/${data}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while deleting the faculty.");
    }
  }
);

export const getSubjects = createAsyncThunk(
  "data/getSubjects",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/module/modules`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while getting the subjects.");
    }
  }
);

export const addSubjects = createAsyncThunk(
  "data/addSubjects",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/module/modules`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while adding the subjects.");
    }
  }
);

export const updateSubjects = createAsyncThunk(
  "data/updateSubjects",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/module/modules/${data.code}`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while updating the subjects.");
    }
  }
);

export const deleteSubjects = createAsyncThunk(
  "data/deleteSubjects",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/module/modules/${data}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while deleting the subjects.");
    }
  }
);

export const getTeachers = createAsyncThunk(
  "data/getTeachers",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/faculty`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while getting the teachers.");
    }
  }
);

export const addTeacher = createAsyncThunk(
  "data/addTeacher",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/register`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while adding the teacher.");
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "data/updateTeacher",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/faculty/${data.id}`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while updating the teacher.");
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "data/deleteTeacher",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/faculty/${data}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while deleting the teacher.");
    }
  }
);

export const getSpaces = createAsyncThunk(
  "data/getSpaces",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/space/spaces`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while getting the spaces.");
    }
  }
);

export const addSpace = createAsyncThunk(
  "data/addSpace",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/space/spaces`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while adding the space.");
    }
  }
);

export const updateSpace = createAsyncThunk(
  "data/updateSpaces",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/space/spaces/${data.code}`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while updating the spaces.");
    }
  }
);

export const deleteSpace = createAsyncThunk(
  "data/deleteSpaces",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/space/spaces/${data}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while deleting the space.");
    }
  }
);

export const getActivities = createAsyncThunk(
  "data/getActivities",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/activity/activities`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while getting the activities.");
    }
  }
);

export const addActivity = createAsyncThunk(
  "data/addActivity",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(`/activity/activities`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while adding the activity.");
    }
  }
);

export const updateActivity = createAsyncThunk(
  "data/updateActivities",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put(`/activity/activities`, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue(
        "An error occurred while updating the activities."
      );
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "data/deleteActivities",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/activity/activities/${data}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.detail);
      }
      return rejectWithValue("An error occurred while deleting the activity.");
    }
  }
);

//ETL

export const downloadTemplate = async (entityType, format = 'xlsx') => {
  try {
    const response = await api.get(`/etl/etl/templates/${entityType}?format=${format}`, {
      responseType: 'arraybuffer'
    });
    
    // Create the correct MIME type based on format
    const mimeType = format === 'csv' ? 
      'text/csv' : 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template.${format}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
    
    return true;
  } catch (error) {
    console.error('Error downloading template:', error);
    throw error;
  }
};

export const uploadData = async (entityType, formData) => {
  try {
    const response = await api.post(`/etl/etl/upload/${entityType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading data:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || 'Failed to upload data');
    }
    throw error;
  }
};
