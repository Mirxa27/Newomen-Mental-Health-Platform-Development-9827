# Newomen Mental Health Platform - Setup Guide

## Overview
Newomen is a comprehensive mental health platform designed specifically for women, featuring AI-powered conversations, shadow work exercises, and culturally-sensitive support. The platform includes both frontend and backend components with PWA capabilities.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Newomen-Mental-Health-Platform-Development-9827
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
npm install
```

### 3. Database Setup

#### Install PostgreSQL
Follow the official PostgreSQL installation guide for your operating system.

#### Create Database
```bash
createdb newomen_db
```

#### Setup Environment Variables
Copy the example environment file:
```bash
cd server
cp .env.example .env
```

Edit `.env` with your database credentials and other configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/newomen_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@newomen.com"
OPENAI_API_KEY="your-openai-api-key"
```

#### Generate Prisma Client and Run Migrations
```bash
cd server
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start the Application

#### Start Backend Server
```bash
cd server
npm run dev
```
The backend will run on `http://localhost:4000`

#### Start Frontend Development Server
```bash
# In a new terminal, from the root directory
npm run dev
```
The frontend will run on `http://localhost:5173`

## Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run serve` - Build and serve production version

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

## Default Credentials

After running the seed script, you can log in with:

### Admin User
- Email: `admin@newomen.com`
- Password: `admin123`

### Demo User
- Email: `demo@newomen.com`
- Password: `demo123`

## Features

### Core Features
- ✅ User authentication (login/register/logout)
- ✅ AI-powered chat interface
- ✅ Shadow work exercises
- ✅ Admin dashboard with analytics
- ✅ User management
- ✅ Conversation monitoring
- ✅ Multi-language support (English/Arabic)
- ✅ PWA capabilities
- ✅ Responsive design with glassmorphic UI

### Technical Features
- ✅ React 18 with Vite
- ✅ Express.js backend
- ✅ PostgreSQL with Prisma ORM
- ✅ JWT authentication
- ✅ Zustand state management
- ✅ TailwindCSS styling
- ✅ Framer Motion animations
- ✅ React Router v7
- ✅ PWA with service worker
- ✅ i18n internationalization
- ✅ Capacitor for mobile deployment

## Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat interface components
│   ├── common/         # Shared components
│   ├── layout/         # Layout components
│   ├── navigation/     # Navigation components
│   └── shadowwork/     # Shadow work components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization
├── layouts/            # Page layouts
├── pages/              # Page components
├── router/             # Routing configuration
├── services/           # API services
├── store/              # Zustand stores
└── utils/              # Utility functions
```

### Backend Structure
```
server/
├── src/
│   ├── routes/         # API routes
│   │   ├── auth.js     # Authentication routes
│   │   ├── chat.js     # Chat routes
│   │   ├── admin.js    # Admin routes
│   │   └── shadowwork.js # Shadow work routes
│   └── index.js        # Main server file
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Database seeding
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id` - Get conversation details
- `POST /api/chat/conversations/:id/messages` - Add message to conversation
- `POST /api/chat/chat` - Send chat message

### Shadow Work
- `GET /api/shadowwork/questions` - Get all questions
- `GET /api/shadowwork/sessions` - Get user sessions
- `POST /api/shadowwork/sessions` - Create/update session
- `GET /api/shadowwork/progress` - Get user progress

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/conversations` - Get all conversations
- `GET /api/admin/analytics` - Get analytics data

## Database Schema

### Users
- `id` - UUID primary key
- `email` - Unique email address
- `name` - User's full name
- `password` - Hashed password
- `role` - User role (user/admin/counsellor)
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Conversations
- `id` - UUID primary key
- `title` - Conversation title
- `userId` - Foreign key to users
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Messages
- `id` - UUID primary key
- `content` - Message content
- `role` - Message role (user/assistant)
- `conversationId` - Foreign key to conversations
- `timestamp` - Message timestamp

### Shadow Work Sessions
- `id` - UUID primary key
- `userId` - Foreign key to users
- `questionId` - Question identifier
- `response` - User's response
- `insights` - Generated insights
- `completed` - Completion status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Deployment

### Development Deployment
1. Follow the setup guide above
2. Both frontend and backend run in development mode
3. Hot reload enabled for development

### Production Deployment

#### Frontend
```bash
npm run build
npm run preview
```

#### Backend
```bash
cd server
npm run db:deploy
npm run start
```

#### Mobile Deployment
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
VITE_OPENAI_API_KEY=your-openai-api-key
```

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/newomen_db
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@newomen.com
OPENAI_API_KEY=your-openai-api-key
```

## Security Features

- JWT-based authentication
- HTTP-only cookies for token storage
- CORS protection
- Input validation
- Password hashing with bcrypt
- SQL injection protection via Prisma

## Monitoring and Analytics

The admin dashboard provides:
- User registration metrics
- Conversation analytics
- Shadow work completion rates
- System health monitoring
- User management tools

## Support

For issues or questions:
1. Check the troubleshooting section in DEPLOYMENT_GUIDE.md
2. Review the logs in the console
3. Check the GitHub issues page

## License

This project is licensed under the MIT License.