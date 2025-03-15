# Timetable Chatbot

A hybrid chatbot system for the Advanced Timetable Scheduling application that combines rule-based and LLM approaches for efficient query handling.

## Architecture Overview

### Frontend Components
- **ChatWidget**: The main UI component that displays the chat interface
- **ChatSuggestion**: Clickable suggestion chips for common queries
- **ChatContainer**: Integration point with the main application

### Backend Components
- **Router**: FastAPI endpoints for chat functionality
- **RuleBasedHandler**: Processes common timetable queries efficiently
- **LLMHandler**: Handles complex, nuanced questions using a language model
- **DecisionRouter**: Intelligently routes queries between the handlers

## Data Flow

1. User sends a message through the ChatWidget
2. Message is dispatched to the backend via Redux action
3. Backend's DecisionRouter determines the query type
4. Query is processed by the appropriate handler (RuleBasedHandler or LLMHandler)
5. Response is returned to the frontend and displayed in the ChatWidget
6. Relevant suggestions are shown for follow-up queries

## Key Features

- **Hybrid Processing**: Uses rule-based system for common queries and LLM for complex ones
- **Personalized Responses**: Considers user role, semester, and context
- **Conversation History**: Maintains context across multiple messages
- **Suggested Queries**: Provides relevant follow-up suggestions
- **Responsive Design**: Works on both desktop and mobile devices

## User Context Integration

The chatbot automatically uses the user's actual subgroup (e.g., SEM202) for personalized responses, fixing the issue where hardcoded values were previously used. This is implemented by:

1. Extracting user data from localStorage or JWT token
2. Including the subgroup information in API requests
3. Using this context to personalize responses about schedules and classes

## Next Steps for Implementation

### Backend
1. Complete the MongoDB schema for chat conversations
2. Implement full token verification in the router
3. Connect the rule-based handler to actual timetable data
4. Add more patterns to the rule-based handler
5. Configure a production-ready LLM solution

### Frontend
1. Add animations for better UX
2. Implement offline support with local storage caching
3. Add file/image sharing capabilities if needed
4. Improve mobile responsiveness
5. Add user feedback collection

## Development Guidelines

This implementation follows our established code structure guidelines:
- Each component/class is in its own file
- Methods and functions are limited to maintain readability
- File sizes are kept reasonable
- Functionality is properly modularized

## Testing

Test the chatbot with various scenarios:
- Basic timetable queries (e.g., "Show my schedule for Monday")
- Complex questions (e.g., "When can I reschedule my CS101 class?")
- Edge cases and error handling
- Performance with long conversation histories
