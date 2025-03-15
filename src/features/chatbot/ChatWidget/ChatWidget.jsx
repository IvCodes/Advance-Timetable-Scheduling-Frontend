import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, List, Avatar, Spin, Tooltip } from 'antd';
import { SendOutlined, CloseOutlined, CommentOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import './ChatWidget.css';
import { ChatSuggestion } from '../ChatSuggestion/ChatSuggestion';
import { sendChatMessage, resetChat } from '../chatSlice';

const { Text } = Typography;

/**
 * ChatWidget component provides a floating chat interface for interacting with the timetable assistant.
 * It manages the chat state locally and communicates with the backend via Redux actions.
 */
function ChatWidget({ position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);
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
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    dispatch(sendChatMessage({ 
      message: suggestion,
      conversationId 
    }));
  };
  
  const renderChatMessages = () => {
    return (
      <List
        className="chat-message-list"
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(msg) => (
          <List.Item className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
            <List.Item.Meta
              avatar={
                msg.role === 'user' 
                  ? <Avatar style={{ backgroundColor: '#1890ff' }}>U</Avatar>
                  : <Avatar style={{ backgroundColor: '#52c41a' }}>A</Avatar>
              }
              content={
                <div className="message-content">
                  <Text>{msg.content}</Text>
                  {msg.timestamp && (
                    <Text type="secondary" className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  
  return (
    <div className={`chat-widget-container ${position}`}>
      {isOpen ? (
        <Card 
          className="chat-widget-card"
          title={
            <div className="chat-widget-header">
              <Text strong>Timetable Assistant</Text>
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={handleClose} 
                className="close-button"
              />
            </div>
          }
          bordered={true}
        >
          <div className="chat-messages-container">
            {renderChatMessages()}
            
            {isLoading && (
              <div className="loading-indicator">
                <Spin size="small" />
                <Text type="secondary">Thinking...</Text>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <Text type="danger">{error}</Text>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          {suggestions && suggestions.length > 0 && (
            <div className="chat-suggestions">
              {suggestions.map((suggestion, index) => (
                <ChatSuggestion 
                  key={index} 
                  text={suggestion} 
                  onClick={() => handleSuggestionClick(suggestion)} 
                />
              ))}
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
              disabled={isLoading}
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
          <Button 
            type="primary" 
            shape="circle" 
            size="large"
            icon={<CommentOutlined />} 
            onClick={toggleChat}
            className="chat-widget-button"
          />
        </Tooltip>
      )}
    </div>
  );
}

ChatWidget.propTypes = {
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
};

export default ChatWidget;
