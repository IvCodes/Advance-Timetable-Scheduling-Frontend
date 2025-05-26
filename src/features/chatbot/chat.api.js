import axios from 'axios';

/**
 * API service for chat functionality
 * Provides methods for interacting with the chatbot backend
 */

// Base URL for API requests - hardcoded for local development
const API_URL = 'http://localhost:8000';

/**
 * Send a chat message to the backend with full context awareness
 * @param {string} message - The message to send
 * @param {string} conversationId - Optional conversation ID for continuing a conversation
 * @param {Object} context - Optional context information for application-aware responses
 * @returns {Promise} - Promise that resolves to the chat response
 */
export const sendChatMessage = async (message, conversationId = null, context = {}) => {
  try {
    // Get current page context
    const currentPage = context.currentPage || window.location.pathname;
    
    // Get user role from localStorage or context
    const userRole = context.userRole || localStorage.getItem('userRole') || 'student';
    
    // Get user ID
    const userId = context.userId || localStorage.getItem('userId') || 'anonymous';
    
    console.log('Sending chat message with context:', {
      message,
      currentPage,
      userRole,
      userId
    });
    
    // Call the enhanced chat API with full context
    const response = await axios.post(`${API_URL}/api/v1/chatbot/message`, {
      message,
      conversation_id: conversationId,
      user_id: userId,
      current_page: currentPage,  // 🆕 Page context for application awareness
      user_role: userRole         // 🆕 Role-based personalization
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
