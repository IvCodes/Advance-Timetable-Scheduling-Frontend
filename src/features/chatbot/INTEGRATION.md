# Chatbot Integration Guide

This guide explains how to integrate the chatbot into the main application.

## Step 1: Add Chatbot Reducer to Redux Store

Update your store configuration file (likely `src/app/store.js`) to include the chatbot reducer:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { chatReducer } from '../features/chatbot';
// ...other imports

export const store = configureStore({
  reducer: {
    // ...other reducers
    chat: chatReducer,
  },
  // ...other store configuration
});
```

## Step 2: Add Chatbot Component to App Layout

Add the `ChatContainer` component to your main application layout component (e.g., `src/App.jsx` or your layout component):

```jsx
import { ChatContainer } from './features/chatbot';
// ...other imports

function App() {
  return (
    <div className="app">
      {/* Your existing application content */}
      
      {/* Add ChatContainer at the end of your component */}
      <ChatContainer />
    </div>
  );
}

export default App;
```

## Step 3: Integrate Backend Router

Add the chatbot router to your FastAPI application in the main backend file (likely `app/main.py`):

```python
from fastapi import FastAPI
from app.routers.chatbot import chatbot_router
# ...other imports

app = FastAPI()

# ...other routers
app.include_router(chatbot_router)
```

## Step 4: Add Required Dependencies

### Backend Dependencies
```bash
pip install langchain motor
```

### Frontend Dependencies
```bash
npm install react-chatbot-kit
```

## Step 5: Complete Implementation

Make sure to fully implement:

1. The decision router in the backend to choose between rule-based and LLM handlers
2. The MongoDB schema for storing conversations
3. Configure the LLM provider if you're using one
4. Add any additional context-specific rules to the rule-based handler

## Step 6: Testing

Test the chatbot with various queries:
- Simple timetable requests (rule-based)
- Complex questions (LLM-based)
- Authentication and authorization
- Error handling and fallbacks

## Notes

- The chatbot uses JWT for authentication, the same as your main application
- It accesses user data from localStorage to personalize responses
- The UI is designed to be responsive and match your application's design system
