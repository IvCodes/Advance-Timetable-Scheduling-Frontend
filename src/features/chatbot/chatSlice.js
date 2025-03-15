import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Async thunk to send a chat message to the backend
 */
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, conversationId }, { rejectWithValue }) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('You need to be logged in to use the chat');
      }
      
      // Get the user data for personalization
      const userString = localStorage.getItem('user');
      const userData = userString ? JSON.parse(userString) : {};
      
      // Call the chat API
      const response = await axios.post('/api/v1/chatbot/message', {
        message,
        user_id: userData.id,
        conversation_id: conversationId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 
        error.message || 
        'Failed to send message'
      );
    }
  }
);

/**
 * Async thunk to fetch conversation history
 */
export const getChatHistory = createAsyncThunk(
  'chat/getHistory',
  async (conversationId, { rejectWithValue }) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('You need to be logged in to view chat history');
      }
      
      // Call the history API
      const response = await axios.get(`/api/v1/chatbot/history/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 
        error.message || 
        'Failed to fetch chat history'
      );
    }
  }
);

/**
 * Chat slice for Redux store
 */
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    conversationId: null,
    suggestions: [],
    isLoading: false,
    error: null
  },
  reducers: {
    // Reset the chat state
    resetChat: (state) => {
      state.messages = [];
      state.conversationId = null;
      state.suggestions = [];
      state.error = null;
    },
    
    // Add a message locally (for offline functionality)
    addLocalMessage: (state, action) => {
      state.messages.push({
        role: action.payload.role,
        content: action.payload.content,
        timestamp: new Date().toISOString()
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle sendChatMessage states
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        
        // Optimistically add user message
        state.messages.push({
          role: 'user',
          content: state.currentUserMessage,
          timestamp: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Add the assistant's response
        state.messages.push({
          role: 'assistant',
          content: action.payload.message,
          timestamp: new Date().toISOString()
        });
        
        // Update conversation ID if it's a new conversation
        if (!state.conversationId) {
          state.conversationId = action.payload.conversation_id;
        }
        
        // Update suggestions
        state.suggestions = action.payload.suggestions || [];
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Handle getChatHistory states
      .addCase(getChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { resetChat, addLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;
