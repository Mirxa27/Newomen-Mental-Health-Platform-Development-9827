# Newomen Mental Health Platform - Deployment Guide

## 🚀 Project Overview

The Newomen Mental Health Platform is a full-stack application consisting of:
- **Frontend**: React 18 + Vite PWA with glassmorphism design
- **Backend**: Node.js + Express API with Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Features**: AI chat, shadow work exercises, admin dashboard

## 📋 Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn package manager
- Git

### Development Tools (Optional)
- Docker and Docker Compose
- VS Code with Prisma extension
- Database GUI (pgAdmin, DBeaver, etc.)

## 🔧 Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd newomen-mental-health-platform
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
cd ..
```

### 3. Environment Variables

Create the following environment files:

#### Frontend (.env)
```bash
# Frontend Environment Variables
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ADMIN_EMAIL=admin@example.com
VITE_API_BASE=http://localhost:4000/api
```

#### Backend (server/.env)
```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/newomen_db

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here_minimum_32_characters

# Admin Configuration
ADMIN_EMAIL=admin@example.com

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# OpenAI Configuration (optional for initial setup)
OPENAI_API_KEY=your_openai_api_key_here
```

## 🗄️ Database Setup

### 1. PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from: https://www.postgresql.org/download/windows/

### 2. Database Creation
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE newomen_db;
CREATE USER newomen_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE newomen_db TO newomen_user;
\q
```

### 3. Database Migration
```bash
cd server
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 🏗️ Local Development

### 1. Start Backend Server
```bash
cd server
npm run dev
```
Backend will run on http://localhost:4000

### 2. Start Frontend Development Server
```bash
# In a new terminal, from project root
npm run dev
```
Frontend will run on http://localhost:5173

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Admin Panel**: http://localhost:5173/admin

### 4. Default Credentials
- **Admin**: admin@newomen.com / admin123
- **Test Users**: sarah@example.com / test123 (and others)

## 🚢 Production Deployment

### Option 1: Traditional VPS Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd newomen-mental-health-platform

# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Setup environment variables
cp .env.example .env
cp server/.env.example server/.env
# Edit the .env files with production values

# Setup database
cd server
npm run db:generate
npm run db:deploy
npm run db:seed
```

#### 3. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'newomen-server',
    script: './server/src/index.js',
    cwd: '/path/to/your/app',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### 4. Nginx Configuration
Create `/etc/nginx/sites-available/newomen`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /path/to/your/app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/newomen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Docker Deployment

#### 1. Docker Files

**Dockerfile** (root directory):
```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend build stage
FROM node:18-alpine AS backend-build
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run db:generate

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install serve for frontend
RUN npm install -g serve

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Copy backend
COPY --from=backend-build /app ./server

# Expose ports
EXPOSE 3000 4000

# Start script
COPY start.sh ./
RUN chmod +x start.sh
CMD ["./start.sh"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: newomen_db
      POSTGRES_USER: newomen_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
      - "4000:4000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://newomen_user:secure_password@postgres:5432/newomen_db
      JWT_SECRET: your_jwt_secret_here
      NODE_ENV: production
    volumes:
      - ./server/.env:/app/server/.env

volumes:
  postgres_data:
```

#### 2. Deploy with Docker
```bash
docker-compose up -d
```

### Option 3: Vercel + Railway/Supabase

#### 1. Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically from main branch

#### 3. Database (Supabase)
1. Create project on Supabase
2. Get connection string
3. Update DATABASE_URL in environment variables

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit .env files
- Use strong JWT secrets (32+ characters)
- Rotate API keys regularly
- Use environment-specific configurations

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access
- Regular backups

### 3. API Security
- Rate limiting (implement with express-rate-limit)
- Input validation
- CORS configuration
- HTTPS enforcement

### 4. Frontend Security
- Content Security Policy (CSP)
- Secure headers
- XSS protection
- CSRF protection

## 📊 Monitoring and Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Application logs
pm2 logs newomen-server

# System resources
htop
df -h
```

### 2. Database Maintenance
```bash
# Backup database
pg_dump -U newomen_user newomen_db > backup.sql

# Restore database
psql -U newomen_user newomen_db < backup.sql

# Monitor database
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### 3. Performance Optimization
- Enable gzip compression
- Configure CDN for static assets
- Database query optimization
- Bundle size analysis

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U newomen_user -d newomen_db -h localhost
```

#### 2. Build Errors
```bash
# Clear cache
npm run build --clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. API Errors
```bash
# Check server logs
pm2 logs newomen-server

# Check environment variables
env | grep -E "(NODE_ENV|DATABASE_URL|JWT_SECRET)"
```

#### 4. Frontend Issues
```bash
# Check browser console
# Check network tab in DevTools
# Verify API endpoints are accessible
```

## 🔄 Updates and Maintenance

### 1. Application Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update
cd server && npm update && cd ..

# Rebuild application
npm run build

# Restart services
pm2 restart all
```

### 2. Database Migrations
```bash
cd server
npm run db:migrate
```

### 3. Security Updates
- Regularly update dependencies
- Monitor security advisories
- Update SSL certificates
- Review access logs

## 📝 Health Checks

### 1. Backend Health Check
```bash
curl http://localhost:4000/api/health
```

### 2. Frontend Health Check
```bash
curl http://localhost:3000
```

### 3. Database Health Check
```bash
psql -U newomen_user -d newomen_db -c "SELECT version();"
```

## 🆘 Support

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community
- Create issues on GitHub repository
- Check existing issues for solutions
- Review deployment logs for errors

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a mental health application that handles sensitive user data. Ensure compliance with relevant regulations (HIPAA, GDPR, etc.) and implement appropriate security measures for production use.