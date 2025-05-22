# Study Plan Assistant - Full Stack Application

## Overview

This is a full-stack web application designed to help users create and manage personalized study plans. The application uses a React frontend with Tailwind CSS and shadcn/ui components, and a Node.js Express backend. The app implements a chatbot assistant that generates study plans based on user preferences and allows for calendar integration to schedule study sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The application uses a modern React (18+) frontend architecture with the following key technologies:

- **React**: Core UI library 
- **Wouter**: Lightweight router for navigation
- **TanStack Query**: Data fetching, caching, and state management
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Vite**: Build tool and development server

The frontend is organized using a component-based architecture with clear separation of concerns:
- Pages for different routes
- Reusable UI components 
- Custom hooks for business logic
- Context providers for global state

### Backend

The backend is built with:

- **Express.js**: Web server framework
- **Drizzle ORM**: Database ORM for PostgreSQL
- **Zod**: Schema validation

The server handles:
- API routes for user data and study plans
- Authentication and session management
- Third-party integrations (Google Calendar, n8n)
- Serving the frontend in production

### Database

The application uses PostgreSQL with Drizzle ORM. The schema includes:

- Users
- User preferences
- Study plans
- Chat messages

### Data Flow

1. User interacts with the UI to create or manage study plans
2. Frontend components make API calls via TanStack Query
3. Express backend processes requests and interacts with the database
4. For chat functionality, messages are sent to an n8n workflow that processes them
5. Calendar events are managed through Google Calendar API integration

## Key Components

### Frontend Components

1. **Chat Interface**: Interactive chat for creating study plans
2. **Study Plan Management**: View, edit, and track study plans
3. **Profile Management**: User preferences and settings
4. **Calendar Integration**: Connect with Google Calendar

### Backend Services

1. **Authentication System**: User login and session management
2. **Study Plan Service**: Create and manage study plans
3. **Chat Service**: Process user messages and generate responses
4. **Calendar Service**: Integration with Google Calendar

### Database Schema

The database schema includes the following main tables:

1. **Users**: Basic user information (username, password, profile)
2. **User Preferences**: Study preferences and settings
3. **Study Plans**: Structured study plans with topics, duration, status
4. **Chat Messages**: Conversation history between user and AI assistant

## External Dependencies

1. **Google Calendar API**: For scheduling study sessions
2. **n8n**: For workflow automation and AI agent integration
3. **Postgres**: Database

## Development Environment

The application is configured for development with:

- Hot module reloading via Vite
- TypeScript for type safety
- ESLint and other code quality tools

## Deployment Strategy

The application is set up for deployment with:

1. Build process that generates optimized static assets for the frontend
2. Production server that serves both the API and static assets
3. Environment variables for configuration in different environments

The deployment automatically:
- Builds the frontend with Vite
- Bundles the server code with esbuild
- Serves the application on port 5000

## Project Structure

```
/
├── client/                 # Frontend code
│   ├── src/                # Source files
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── providers/      # Context providers
│   └── index.html          # HTML entry point
├── server/                 # Backend code
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite integration
├── shared/                 # Shared code
│   └── schema.ts           # Database schema and validators
├── migrations/             # Database migrations
├── drizzle.config.ts       # Drizzle ORM configuration
└── vite.config.ts          # Vite configuration
```