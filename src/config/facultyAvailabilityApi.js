import makeApi from './axiosConfig';

const API_BASE_URL = '/faculty-availability';

// Faculty Availability API functions
export const facultyAvailabilityApi = {
  // Check faculty availability for specific date/time
  checkAvailability: async (facultyId, date, timeSlots = null) => {
    try {
      const api = makeApi();
      const response = await api.post(`${API_BASE_URL}/check`, {
        faculty_id: facultyId,
        date: date,
        time_slots: timeSlots
      });
      return response.data;
    } catch (error) {
      console.error('Error checking faculty availability:', error);
      throw error;
    }
  },

  // Get available faculty for assignment
  getAvailableFaculty: async (date, timeSlot = null, subjectId = null) => {
    try {
      const api = makeApi();
      const response = await api.post(`${API_BASE_URL}/available-faculty`, {
        date: date,
        time_slot: timeSlot,
        subject_id: subjectId
      });
      return response.data;
    } catch (error) {
      console.error('Error getting available faculty:', error);
      throw error;
    }
  },

  // Validate timetable assignment
  validateAssignment: async (facultyId, date, timeSlot, subjectId = null) => {
    try {
      const api = makeApi();
      const response = await api.post(`${API_BASE_URL}/validate-assignment`, {
        faculty_id: facultyId,
        date: date,
        time_slot: timeSlot,
        subject_id: subjectId
      });
      return response.data;
    } catch (error) {
      console.error('Error validating assignment:', error);
      throw error;
    }
  },

  // Check for conflicts
  checkConflicts: async (facultyId, date, timeSlot) => {
    try {
      const api = makeApi();
      const response = await api.post(`${API_BASE_URL}/check-conflicts`, {
        faculty_id: facultyId,
        date: date,
        time_slot: timeSlot
      });
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      throw error;
    }
  },

  // Get faculty unavailable dates
  getFacultyUnavailableDates: async (facultyId) => {
    try {
      const api = makeApi();
      const response = await api.get(`${API_BASE_URL}/faculty/${facultyId}/unavailable-dates`);
      return response.data;
    } catch (error) {
      console.error('Error getting faculty unavailable dates:', error);
      throw error;
    }
  },

  // Submit unavailability request
  submitUnavailabilityRequest: async (requestData) => {
    try {
      const api = makeApi();
      const response = await api.post(`${API_BASE_URL}/unavailability-requests`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error submitting unavailability request:', error);
      throw error;
    }
  },

  // Get faculty unavailability requests
  getFacultyUnavailabilityRequests: async (facultyId) => {
    try {
      const api = makeApi();
      const response = await api.get(`${API_BASE_URL}/faculty/${facultyId}/requests`);
      return response.data;
    } catch (error) {
      console.error('Error getting faculty unavailability requests:', error);
      throw error;
    }
  },

  // Update unavailability request
  updateUnavailabilityRequest: async (requestId, updateData) => {
    try {
      const api = makeApi();
      const response = await api.put(`${API_BASE_URL}/unavailability-requests/${requestId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating unavailability request:', error);
      throw error;
    }
  },

  // Delete unavailability request
  deleteUnavailabilityRequest: async (requestId) => {
    try {
      const api = makeApi();
      const response = await api.delete(`${API_BASE_URL}/unavailability-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting unavailability request:', error);
      throw error;
    }
  },

  // Get faculty schedule for a specific date range
  getFacultySchedule: async (facultyId, startDate, endDate) => {
    try {
      const api = makeApi();
      const response = await api.get(`${API_BASE_URL}/faculty/${facultyId}/schedule`, {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting faculty schedule:', error);
      throw error;
    }
  },

  // Get all faculty with their availability status for a specific date
  getAllFacultyAvailability: async (date, timeSlot = null) => {
    try {
      const api = makeApi();
      const response = await api.get(`${API_BASE_URL}/all-faculty-availability`, {
        params: {
          date: date,
          time_slot: timeSlot ? JSON.stringify(timeSlot) : null
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting all faculty availability:', error);
      throw error;
    }
  }
};

// Utility functions for frontend
export const availabilityUtils = {
  // Format availability status for display
  formatAvailabilityStatus: (status) => {
    const statusMap = {
      'available': { text: 'Available', color: 'green' },
      'unavailable': { text: 'Unavailable', color: 'red' },
      'partially_available': { text: 'Partially Available', color: 'orange' }
    };
    return statusMap[status] || { text: 'Unknown', color: 'gray' };
  },

  // Check if a time slot conflicts with unavailability
  hasTimeConflict: (unavailableSlots, checkSlot) => {
    if (!unavailableSlots || !Array.isArray(unavailableSlots)) return false;
    
    return unavailableSlots.some(slot => {
      const slotStart = new Date(`1970-01-01T${slot.start_time}`);
      const slotEnd = new Date(`1970-01-01T${slot.end_time}`);
      const checkStart = new Date(`1970-01-01T${checkSlot.start_time}`);
      const checkEnd = new Date(`1970-01-01T${checkSlot.end_time}`);
      
      return (checkStart < slotEnd && checkEnd > slotStart);
    });
  },

  // Get availability color for UI
  getAvailabilityColor: (status) => {
    const colors = {
      'available': '#52c41a',
      'unavailable': '#ff4d4f',
      'partially_available': '#faad14'
    };
    return colors[status] || '#d9d9d9';
  },

  // Format time slot for display
  formatTimeSlot: (timeSlot) => {
    if (!timeSlot) return '';
    return `${timeSlot.start_time} - ${timeSlot.end_time}`;
  },

  // Validate time slot format
  isValidTimeSlot: (timeSlot) => {
    if (!timeSlot || !timeSlot.start_time || !timeSlot.end_time) return false;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeSlot.start_time) && timeRegex.test(timeSlot.end_time);
  }
};

export default facultyAvailabilityApi; 