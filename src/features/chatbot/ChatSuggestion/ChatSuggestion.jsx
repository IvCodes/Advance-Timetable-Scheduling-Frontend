import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import './ChatSuggestion.css';

/**
 * ChatSuggestion component renders a clickable suggestion chip
 * that users can click on to quickly send common queries.
 */
export function ChatSuggestion({ text, onClick }) {
  return (
    <Button 
      className="chat-suggestion"
      type="default"
      size="small"
      onClick={onClick}
    >
      {text}
    </Button>
  );
}

ChatSuggestion.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};
