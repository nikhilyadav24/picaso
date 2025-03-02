# Picaso

## Overview
Picaso is an AI-powered chatbot designed to help users understand Data Structures and Algorithms (DSA) problems. Users can submit a LeetCode problem URL along with their doubts, and the chatbot will provide hints and explanations to guide them toward solutions without giving direct answers.

## Features
- AI-driven guidance using **Gemini-3.5-Turbo**.
- Helps users understand problems through hints rather than direct solutions.
- Simple and intuitive UI for submitting questions.
- Supports natural language input for seamless interaction.

## Project Structure
```
GPT-Teaching-Assistant/
├── backend/
│   ├── server.js         # Backend server handling API calls
│   ├── package.json      # Backend dependencies
├── frontend/
│   ├── src/              # React components
│   ├── public/           # Public assets
│   ├── package.json      # Frontend dependencies         
└── README.md             # Documentation
```

## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/nikhilyadav24/picaso-main
cd picaso
```

### 2. Backend Setup
```sh
cd backend
npm install
```
- Open `.env` and add your **Gemini API key**: 
```
GEMINI_API_KEY=your_api_key_here
```
- Start the backend server:
```sh
node server.js
```

### 3. Frontend Setup
- Open a new terminal:
```sh
cd ../frontend
npm install
npm run dev
```


## How It Works
1. The user enters a **LeetCode problem URL** and describes their doubt.
2. The frontend sends a request to the backend (`server.js`).
3. The backend processes the request and calls the **Gemini-3.5-Turbo API**.
4. The AI model generates a response, which is sent back to the frontend.
5. The response is displayed to the user in a chat format.
   

