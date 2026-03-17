# 🚀 AI Chat Application - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation & Setup](#installation--setup)
5. [Project Structure](#project-structure)
6. [Running the Application](#running-the-application)
7. [API Endpoints](#api-endpoints)
8. [Usage Guide](#usage-guide)
9. [Architecture](#architecture)

---

## 📌 Project Overview

This is a **Guest Chat Application** built with a modern tech stack combining **Next.js 16** (React 19) frontend and **FastAPI** backend powered by **Google Gemini AI**. The application provides an intuitive chat interface with task generation, summarization, and action suggestion capabilities.

**Key Concept**: A guest user can create multiple chat conversations, each saved locally with full chat history. The AI processes different types of requests (chat, tasks, summaries, projects) through backend endpoints.

---

## ✨ Features

### Frontend Features
- ✅ **Multiple Chat Conversations** - Create unlimited chats saved in localStorage
- ✅ **Chat History Management** - All chats automatically grouped by date
- ✅ **Category System** - 5 different modes: Chat, Task, Todo, Summary, Project
- ✅ **@ Mention Suggestions** - Type "@" to see helpful command suggestions
- ✅ **Auto-scrolling Messages** - Smooth scrolling to latest messages
- ✅ **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- ✅ **Guest Profile** - Shows guest user information with logout option
- ✅ **Message Timestamps** - Each message displays when it was sent
- ✅ **Dynamic Placeholders** - Input placeholder changes based on selected mode

### Backend Features
- ✅ **Gemini AI Integration** - Powered by Google's Gemini 2.5 Flash model
- ✅ **Multiple Endpoints** - Different endpoints for different request types
- ✅ **CORS Support** - Allows requests from frontend (localhost:3000, 3001)
- ✅ **JSON Response Parsing** - Intelligent JSON extraction and validation
- ✅ **Priority-based Tasks** - Tasks returned with High/Medium/Low priorities
- ✅ **Error Handling** - Comprehensive error responses with details
- ✅ **Health Check** - Built-in API health monitoring

### Chat Categories
| Category | Icon | Endpoint | Purpose |
|----------|------|----------|---------|
| Chat | 💬 | `/generate` | General AI conversation |
| Task | ✅ | `/generate-todo` | Task generation with priorities |
| Todo | 📋 | `/generate-todo` | Create todo lists |
| Summary | 📝 | `/generate-summary` | Project summarization |
| Project | ⚡ | `/generate-action` | Suggest next actions |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (React 19.2.3)
- **Styling**: Tailwind CSS 4 (PostCSS)
- **Icons**: Lucide React
- **Language**: TypeScript 5
- **State Management**: React Hooks (useState, useRef, useEffect)
- **Storage**: Browser LocalStorage
- **Build Tool**: Turbopack (Next.js integrated)

### Backend
- **Framework**: FastAPI (Python)
- **AI Model**: Google Gemini 2.5 Flash
- **SDK**: Google GenAI (`google-genai`)
- **CORS**: FastAPI CORS Middleware
- **Data Validation**: Pydantic
- **Server**: Uvicorn

### Environment
- **Node.js**: v18+ (for frontend)
- **Python**: 3.8+ (for backend)
- **Database**: localStorage (frontend persistence)

---

## 📥 Installation & Setup

### Prerequisites
- Node.js 18 or higher
- Python 3.8 or higher
- Git
- API Key for Google Gemini (Get from: https://ai.google.dev)

### Step 1: Clone the Repository
```bash
# Navigate to project directory
cd d:\poc
```

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\Activate.ps1

# On Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo GEMINI_API_KEY=your_api_key_here > .env

# Run the backend server
uvicorn main.py:app --reload --host 127.0.0.1 --port 8000
```

**Backend runs on**: `http://localhost:8000`

### Step 3: Frontend Setup

```bash
# Navigate to frontend folder (in new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on**: `http://localhost:3000`

### Verify Installation
- Backend API: http://localhost:8000/docs (Swagger UI)
- Frontend App: http://localhost:3000
- Health Check: http://localhost:8000/health

---

## 📁 Project Structure

```
d:\poc/
├── backend/
│   ├── main.py                 # FastAPI application & endpoints
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables (create this)
│   └── test.json               # Test data
│
└── frontend/
    ├── src/
    │   └── app/
    │       ├── page.tsx         # Main chat component
    │       ├── layout.tsx        # Page layout
    │       └── globals.css       # Global styles
    ├── package.json            # NPM dependencies
    ├── tsconfig.json           # TypeScript config
    ├── next.config.ts          # Next.js config
    └── postcss.config.mjs       # PostCSS config
```

---

## 🚀 Running the Application

### Full Startup (Recommended)

**Terminal 1 - Backend:**
```bash
cd d:\poc\backend
.venv\Scripts\Activate.ps1
uvicorn main.py:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd d:\poc\frontend
npm run dev
```

### Development Commands

**Frontend**:
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Start production server
```

**Backend**:
```bash
uvicorn main.py:app --reload              # Development with auto-reload
uvicorn main.py:app --host 0.0.0.0        # Public access
uvicorn main.py:app --port 8001           # Custom port
```

---

## 🔌 API Endpoints

All endpoints accept POST requests with JSON body: `{ "text": "user input" }`

### 1. Health Check
```
GET http://localhost:8000/health
Response: { "status": "healthy" }
```

### 2. General Chat
```
POST http://localhost:8000/generate
Body: { "text": "Hello, what do you do?" }
Response: { "reply": "I am an AI assistant..." }
```

### 3. Generate Tasks/Todo
```
POST http://localhost:8000/generate-todo
Body: { "text": "Build a website and mobile app" }
Response: {
  "tasks": [
    { "title": "Design UI mockups", "priority": "High" },
    { "title": "Setup development environment", "priority": "High" },
    { "title": "Create database schema", "priority": "Medium" }
  ]
}
```

### 4. Generate Summary
```
POST http://localhost:8000/generate-summary
Body: { "text": "Project description here..." }
Response: { "summary": "Brief 1-2 sentence summary" }
```

### 5. Generate Next Action
```
POST http://localhost:8000/generate-action
Body: { "text": "Current project status..." }
Response: { "next_action": "The most important next step is..." }
```

---

## 💬 Usage Guide

### Using the Chat Interface

#### Creating a Chat
1. Click **"+ New Chat"** button in the sidebar
2. A new conversation is created
3. Start typing your message
4. Press **Enter** or click **Send**

#### Selecting Categories
Use the category buttons at the top:
- **💬 Chat**: Normal conversation with AI
- **✅ Task**: Generate actionable tasks
- **📋 Todo**: Create todo lists
- **📝 Summary**: Get project summary
- **⚡ Project**: Get next action suggestion

#### Using @ Mentions
1. Type **"@"** in the message box
2. A dropdown shows 5 suggestion options
3. Click on any option to insert the mention
4. Type your question after the mention

Example flows:
```
@task Build a chatbot
→ AI generates 3-5 tasks with priorities

@summary We built a React app with Node backend
→ AI provides a brief project summary

@project We completed database design
→ AI suggests the next most important step
```

#### Chat History
- All chats are **automatically saved** to browser storage
- Chats are **organized by date** (Today, Yesterday, etc.)
- **Delete chats** by clicking the trash icon
- **Click any chat** to continue the conversation
- Chat titles are **automatically set** to first message

#### Logout
- Click **"Logout"** button in bottom left
- **All chats are deleted**
- Starts fresh chat experience

---

## 🏗️ Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│            User Interface (Frontend)                │
│  • React 19 Components                              │
│  • Tailwind CSS Styling                             │
│  • TypeScript Type Safety                           │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTP Requests (JSON)
                     ↓
┌─────────────────────────────────────────────────────┐
│     FastAPI Server (Backend)                        │
│  • CORS Middleware                                  │
│  • Request Validation (Pydantic)                    │
│  • Route Handling                                   │
└────────────────────┬────────────────────────────────┘
                     │
                     │ API Calls
                     ↓
┌─────────────────────────────────────────────────────┐
│     Google Gemini AI                                │
│  • Process user text                                │
│  • Generate responses                               │
│  • Format JSON output                               │
└─────────────────────────────────────────────────────┘
```

### State Management (Frontend)

```typescript
// Main state variables
const [chats, setChats]                    // All conversations
const [activeChat, setActiveChat]          // Currently selected chat
const [input, setInput]                    // Current message text
const [selectedMode, setSelectedMode]      // Chat category (chat/task/todo/summary/project)
const [showMentions, setShowMentions]      // Show @ suggestions
const [sidebarOpen, setSidebarOpen]        // Mobile sidebar toggle
```

### Message Format

```typescript
interface Message {
  id: string              // Unique identifier
  role: "user" | "guest"  // Sender type
  content: string         // Message text
  timestamp: Date         // When sent
}

interface Chat {
  id: string              // Chat ID
  title: string           // Display title
  messages: Message[]     // All messages
  createdAt: Date         // Creation time
  date: string            // Date string for grouping
}
```

---

## 🔑 Key Implementation Details

### Message Processing
1. User input captured via textarea
2. Mode selected (chat/task/todo/etc)
3. Message sent with mode prefix
4. Backend API called based on mode
5. Response parsed and displayed
6. Chat auto-saved to localStorage

### Auto-scroll Logic
```typescript
useEffect(() => {
  if (messagesContainerRef.current) {
    // Scroll to bottom when new messages arrive
    messagesContainerRef.current.scrollTop = 
      messagesContainerRef.current.scrollHeight;
  }
}, [chats, activeChat]);
```

### @ Mention System
- Shows when user types "@"
- Displays 5 category suggestions
- Click to insert mention
- Updates input with selected mode

### Responsive Design
- Mobile: Collapsible sidebar with overlay
- Tablet: Adjusted spacing and font sizes
- Desktop: Full-width layout with sidebar

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: GEMINI_API_KEY error
```bash
Solution: Create .env file in backend folder with:
GEMINI_API_KEY=your_actual_api_key_here
```

**Issue**: Port 8000 already in use
```bash
Solution: Use different port:
uvicorn main.py:app --port 8001
```

**Issue**: ModuleNotFoundError
```bash
Solution: Install dependencies:
pip install -r requirements.txt
```

### Frontend Issues

**Issue**: Messages not scrolling
```bash
Solution: Make sure browser localStorage is enabled
Clear cache: Ctrl+Shift+Delete
```

**Issue**: @ suggestions not showing
```bash
Solution: Type "@" and wait for dropdown
Click on any suggestion in the list
```

**Issue**: Can't connect to backend
```bash
Solution: Verify backend is running on http://localhost:8000
Check CORS: allowed_origins includes "http://localhost:3000"
```

---

## 📊 Performance Notes

- **Frontend**: Optimized with Next.js Turbopack (fast incremental builds)
- **Caching**: Messages cached in browser localStorage
- **Scrolling**: Smooth scroll enabled for better UX
- **API**: Gemini model provides quick responses (< 2 seconds typically)
- **Bundle Size**: Minimal dependencies for fast loading

---

## 🔐 Security Considerations

1. **API Key**: Never commit .env file to git
2. **CORS**: Only allows localhost (modify for production)
3. **Input**: All user inputs sanitized by Pydantic
4. **Storage**: LocalStorage is client-side (not shared)
5. **HTTPS**: Use in production only

---

## 📝 Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_api_key_here
```

### Frontend
No .env needed - API URL is hardcoded to `http://localhost:8000`

---

## 🚀 Deployment Recommendations

### Production Deployment
1. Use environment-specific configurations
2. Deploy backend to cloud (Vercel, Railway, Heroku)
3. Deploy frontend to Vercel/Netlify
4. Set proper CORS origins for production domains
5. Use HTTPS everywhere
6. Enable proper logging and monitoring

---

## 📚 Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **FastAPI**: https://fastapi.tiangolo.com
- **Google Gemini**: https://ai.google.dev
- **TypeScript**: https://www.typescriptlang.org

---

## 👤 Guest User Experience
- No authentication required
- All data stored locally in browser
- Full functionality with chat history
- Persistent across browser sessions
- Complete logout clears all data

---

## ✅ Testing Checklist

- [ ] Backend starts on port 8000
- [ ] Frontend starts on port 3000
- [ ] Can create new chats
- [ ] Can send messages in chat mode
- [ ] @ mentions show suggestions
- [ ] Task generation works (✅ Task)
- [ ] Summary generation works (📝 Summary)
- [ ] Project suggestions work (⚡ Project)
- [ ] Chat history saves after page refresh
- [ ] Can delete chats
- [ ] Logout clears all data
- [ ] Responsive on mobile view
- [ ] Messages scroll automatically

---

**Last Updated**: March 17, 2026  
**Version**: 1.0.0  
**Status**: ✅ Full Stack Complete

