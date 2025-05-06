# Ollama AI Chat Application

A simple chat application that connects to a local Ollama LLM model using Express.js backend and AngularJS frontend.

## Prerequisites

- Node.js installed
- Ollama running locally (accessible at http://localhost:11434)
- A modern web browser

## Project Structure

```
mean-mini-project/
├── public/
│   ├── index.html
│   └── app.js
├── server.js
├── package.json
└── package-lock.json
```

## Setup and Running

### Start the Application

```bash
npm install
node server.js
```

The application will start on http://localhost:3000. Simply open this URL in your web browser to access the chat interface.

### 3. Using the Chat Interface

1. Type your message in the input box
2. Press Enter or click Send
3. Wait for the AI's response
4. Continue the conversation!

## Features

- Real-time chat interface
- Loading indicator while waiting for responses
- Error handling for API connection issues
- Clean, responsive UI
- Automatic scrolling to latest messages

## Notes

- Make sure Ollama is running and accessible at http://localhost:11434
- The default model is set to 'llama2' - you can change this in `backend/server.js`
- Chat history is maintained in memory for the current session # mean-mini-project
