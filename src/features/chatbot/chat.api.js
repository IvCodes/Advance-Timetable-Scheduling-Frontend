import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * API service for chat functionality
 * Provides methods for interacting with the chatbot backend
 */

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Send a chat message to the backend
 */
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, conversationId }, { rejectWithValue }) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      // Call the chat API
      const response = await axios.post(`${API_URL}/api/v1/chatbot/message`, {
        message,
        conversation_id: conversationId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return rejectWithValue(
        error.response?.data?.detail || 
        error.message || 
        'Failed to send message. Please try again.'
      );
    }
  }
);

/**
 * Fetch conversation history
 */
export const getChatHistory = createAsyncThunk(
  'chat/getHistory',
  async (conversationId, { rejectWithValue }) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Authentication required. Please log in.');
      }
      
      // Call the history API
      const response = await axios.get(`${API_URL}/api/v1/chatbot/history/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return rejectWithValue(
        error.response?.data?.detail || 
        error.message || 
        'Failed to fetch chat history. Please try again.'
      );
    }
  }
);
