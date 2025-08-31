# 🤖 AI-Powered Personal Assistant with Calendar Integration

A full-stack web application that combines AI chatbot capabilities with Google Calendar integration, enabling users to manage their schedule through natural language conversations.

![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7+-red?style=flat&logo=redis)

## ✨ Features

### 🤖 AI Chatbot
- **Natural Language Processing**: Schedule meetings and manage calendar through conversation
- **Context Awareness**: Remembers conversation history and user preferences
- **Customizable Rules**: Set conversation guidelines for personalized AI behavior
- **Real-time Chat**: Instant responses with message history persistence

### 📅 Calendar Integration
- **Google Calendar OAuth**: Secure authentication and token management
- **Smart Scheduling**: AI-powered event creation and management
- **Real-time Sync**: Live calendar status and availability checking
- **Event Management**: Create, read, and update calendar events

### 🔐 User Management
- **Secure Authentication**: JWT-based user authentication system
- **User Profiles**: Personalized settings and conversation history
- **Session Management**: Persistent login with secure token storage

## ��️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Redux Toolkit** for state management
- **Tailwind CSS** for modern, responsive UI
- **React Router** for client-side routing
- **Custom Components** for reusable UI elements

### Backend
- **Dual Node.js Architecture**: Separate services for auth and main functionality
- **Express.js** RESTful API with middleware
- **PostgreSQL** for relational data storage
- **Redis** for caching and session management
- **Google OAuth 2.0** for calendar integration
- **Twilio** for sms notification

### Services
- **AI Service**: Handles chatbot interactions and responses
- **Calendar Service**: Manages Google Calendar operations
- **Vector Search**: Semantic search for better AI understanding
- **SMS Service**: Text message notifications
- **Scheduler Service**: Automated task management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Google Cloud Platform account (for Calendar API)

### Installation

1. **Clone the repository**
```bash
git clone 
cd chatbot-v2
```

2. **Install dependencies**
```bash
# Frontend
cd frontend/chatbot-v2
npm install

# Backend (Auth Service)
cd ../../backend/auth-backend
npm install

# Backend (Main Service)
cd ../main-backend
npm install
```

3. **Environment Setup**
```bash
# Create .env files in both backend directories
cp .env.example .env
```

4. **Database Setup**
```bash
# Run schema files
psql -U your_user -d your_database -f database/schema.sql
```

5. **Start Services**
```bash
# Terminal 1: Auth Backend
cd backend/auth-backend
npm run dev

# Terminal 2: Main Backend
cd backend/main-backend
npm run dev

# Terminal 3: Frontend
cd frontend/chatbot-v2
npm run dev
```

## �� Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_jwt_secret
```

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Connect Calendar**: Authenticate with Google Calendar
3. **Start Chatting**: Ask the AI to schedule meetings, check availability, or manage events
4. **Manage Conversations**: View chat history and customize AI behavior

### Example Commands
- "Schedule a meeting with John tomorrow at 2 PM"
- "What's on my calendar for next week?"
- "Create a 1-hour block for project work on Friday"
- "Show me my available time slots this afternoon"

## 🛠️ Technical Highlights

- **TypeScript**: Full type safety across frontend and backend
- **Redux Toolkit**: Modern state management with RTK Query
- **OAuth Security**: Secure third-party service integration
- **Real-time Updates**: Live calendar status and chat synchronization
- **Modular Architecture**: Scalable service-based backend design
- **Vector Search**: Semantic understanding for better AI responses
