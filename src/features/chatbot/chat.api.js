import axios from 'axios';

/**
 * API service for chat functionality
 * Provides methods for interacting with the chatbot backend
 */

// Base URL for API requests - hardcoded for local development
const API_URL = 'http://localhost:8000';

/**
 * Send a chat message to the backend
 * @param {string} message - The message to send
 * @param {string} conversationId - Optional conversation ID for continuing a conversation
 * @returns {Promise} - Promise that resolves to the chat response
 */
export const sendChatMessage = async (message, conversationId = null) => {
  try {
    // Call the chat API without requiring authentication
    const response = await axios.post(`${API_URL}/api/v1/chatbot/message`, {
      message,
      conversation_id: conversationId,
      user_id: localStorage.getItem('userId') || 'anonymous'
    });
    
    return response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Fetch conversation history
 * @param {string} conversationId - The ID of the conversation to fetch
 * @returns {Promise} - Promise that resolves to the conversation history
 */
export const getChatHistory = async (conversationId) => {
  try {
    // Call the history API without requiring authentication
    const response = await axios.get(`${API_URL}/api/v1/chatbot/history/${conversationId}`);
    
    return response;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};
