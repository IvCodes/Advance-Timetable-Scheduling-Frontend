import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider } from 'antd';
import ChatWidget from '../ChatWidget/ChatWidget';
import { resetChat } from '../chatSlice';

/**
 * ChatContainer is responsible for integrating the ChatWidget into the main application.
 * It handles global state management and theme configuration.
 */
function ChatContainer() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || { user: null });
  
  // Reset chat when user changes
  useEffect(() => {
    if (user) {
      dispatch(resetChat());
    }
  }, [user?.id, dispatch]);
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <ChatWidget position="bottom-right" />
    </ConfigProvider>
  );
}

export default ChatContainer;
