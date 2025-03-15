import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, Avatar, Spin, Tooltip, Badge } from 'antd';
import { SendOutlined, CloseOutlined, CommentOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import './ChatWidget.css';
import { ChatSuggestion } from '../ChatSuggestion/ChatSuggestion';
import { sendChatMessage, clearError } from '../chatSlice';

const { Text, Title } = Typography;

/**
 * ChatWidget component provides a floating chat interface for interacting with the timetable assistant.
 * It manages the chat state locally and communicates with the backend via Redux actions.
 */
function ChatWidget({ position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  
  const { 
    messages, 
    isLoading, 
    conversationId, 
    suggestions, 
    error 
  } = useSelector((state) => state.chat);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);
  
  // Open chat if there's an error to display it
  useEffect(() => {
    if (error && !isOpen) {
      setIsOpen(true);
    }
  }, [error]);
  
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleClose = () => {
    setIsOpen(false);
    // Clear any errors when closing
    if (error) {
      dispatch(clearError());
    }
  };
  
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = () => {
    if (message.trim()) {
      dispatch(sendChatMessage({ 
        message: message.trim(),
        conversationId 
      }));
      
      setMessage('');
      // Show suggestions after sending a message
      setIsSuggestionsVisible(true);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    dispatch(sendChatMessage({ 
      message: suggestion,
      conversationId 
    }));
  };
  
  const toggleSuggestions = () => {
    setIsSuggestionsVisible(!isSuggestionsVisible);
  };
  
  const renderChatMessages = () => {
    return (
      <div className="chat-message-list">
        {messages.map((msg, index) => (
          <div 
            key={`msg-${index}`}
            className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-avatar">
              {msg.role === 'user' 
                ? <Avatar className="avatar-user">U</Avatar>
                : <Avatar className="avatar-assistant">A</Avatar>
              }
            </div>
            <div className="message-bubble">
              <div className="message-sender">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="message-content">
                <Text style={{ color: msg.role === 'user' ? 'white' : '#f0f0f0', whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                {msg.timestamp && (
                  <Text type="secondary" className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`chat-widget-container ${position}`}>
      {isOpen ? (
        <Card 
          className="chat-widget-card"
          title={
            <div className="chat-widget-header">
              <Title level={5} style={{ margin: 0, color: '#f0f0f0' }}>Timetable Assistant</Title>
              <Button 
                type="text" 
                icon={<CloseOutlined style={{ color: '#f0f0f0' }} />} 
                onClick={handleClose} 
                className="close-button"
                style={{ marginRight: -8 }}
              />
            </div>
          }
          bordered={true}
          headStyle={{ padding: 0, borderBottom: 'none' }}
        >
          <div className="chat-messages-container">
            {renderChatMessages()}
            
            {isLoading && (
              <div className="loading-indicator">
                <Spin size="small" />
                <Text style={{ color: '#f0f0f0' }}>Thinking...</Text>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <Text type="danger">{error}</Text>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          {suggestions && suggestions.length > 0 && isSuggestionsVisible && (
            <div className="chat-suggestions">
              <div className="suggestions-header">
                <Text style={{ color: '#aaa', fontSize: '12px' }}>Suggested questions</Text>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseCircleOutlined style={{ color: '#aaa' }} />} 
                  onClick={toggleSuggestions}
                  style={{ padding: '0', marginLeft: 'auto' }}
                />
              </div>
              <div className="suggestions-container">
                {suggestions.map((suggestion) => (
                  <ChatSuggestion 
                    key={`suggestion-${suggestion}`} 
                    text={suggestion} 
                    onClick={() => handleSuggestionClick(suggestion)} 
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="chat-input-container">
            <Input.TextArea
              className="chat-input"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your timetable..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ color: '#f0f0f0', backgroundColor: '#3a3a3a' }}
              disabled={isLoading}
              ref={inputRef}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage} 
              disabled={!message.trim() || isLoading}
              className="send-button"
            />
          </div>
        </Card>
      ) : (
        <Tooltip title="Chat with Timetable Assistant">
          <Badge dot={!!error}>
            <Button 
              type="primary" 
              shape="circle" 
              size="large"
              icon={<CommentOutlined style={{ fontSize: '28px' }} />} 
              onClick={toggleChat}
              className="chat-widget-button"
              style={{ backgroundColor: '#1D80E9', borderColor: '#1D80E9' }}
            />
          </Badge>
        </Tooltip>
      )}
    </div>
  );
}

ChatWidget.propTypes = {
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left'])
};

export default ChatWidget;