import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './chat.api';

// Async thunks
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, conversationId }, { rejectWithValue }) => {
    try {
      const response = await api.sendChatMessage(message, conversationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConversationHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.getChatHistory(conversationId);
      return {
        messages: response.data,
        conversation_id: conversationId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  messages: [],
  isLoading: false,
  conversationId: null,
  suggestions: [],
  error: null
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChat: (state) => {
      state.messages = [];
      state.conversationId = null;
      state.suggestions = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle sendChatMessage states
      .addCase(sendChatMessage.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        
        // Add user message to the messages array immediately
        state.messages.push({
          role: 'user',
          content: action.meta.arg.message,
          timestamp: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversationId = action.payload.conversation_id;
        state.suggestions = action.payload.suggestions || [];
        
        // Add assistant response to messages
        state.messages.push({
          role: 'assistant',
          content: action.payload.message,
          timestamp: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send message';
      })
      .addCase(fetchConversationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages || [];
        state.conversationId = action.payload.conversation_id;
      })
      .addCase(fetchConversationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch conversation history';
      });
  }
});

export const { resetChat, clearError } = chatSlice.actions;
export default chatSlice.reducer;
