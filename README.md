# Life Insurance Recommendation MVP

A full-stack prototype of a life insurance recommendation engine built with Next.js, Node.js, PostgreSQL, and Docker.

## Features

- **Frontend**: Next.js with TypeScript, responsive UI with Tailwind CSS
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with proper schema design
- **Docker**: Local development environment
- **Authentication**: JWT-based authentication with email/password
- **Logging & Monitoring**: Comprehensive logging with Winston
- **Security**: Rate limiting, CORS, input validation, and security headers
- **AWS Ready**: Deployment instructions included

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Deployment**: AWS ECS ready

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tech_assess
   ```

2. **Start the application with Docker**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Manual Setup (Alternative)

1. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy example files
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

3. **Start PostgreSQL**
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=insurance_db -p 5432:5432 -d postgres:15
   ```

4. **Run migrations**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start services**
   ```bash
   # Backend (in one terminal)
   cd backend
   npm run dev

   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

## API Documentation

### POST /api/recommendation

Submit user profile data to get a personalized life insurance recommendation.

**Request Body:**
```json
{
  "age": 35,
  "income": 75000,
  "dependents": 2,
  "riskTolerance": "medium"
}
```

**Response:**
```json
{
  "recommendation": {
    "type": "Term Life",
    "coverage": "$500,000",
    "duration": "20 years",
    "explanation": "Based on your age, income, and dependents, we recommend a 20-year term life policy..."
  }
}
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication header).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Database Schema

```sql
CREATE TABLE user_submissions (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL,
  income INTEGER NOT NULL,
  dependents INTEGER NOT NULL,
  risk_tolerance VARCHAR(10) NOT NULL,
  recommendation_type VARCHAR(50) NOT NULL,
  coverage_amount VARCHAR(20) NOT NULL,
  duration VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - RECOMMENDED

This is the best option for most users as it provides optimal performance and is completely free.

**Frontend on Vercel:**
- Perfect for Next.js applications
- Free tier with automatic deployments
- Global CDN and automatic HTTPS
- Zero configuration required

**Backend on Render:**
- Free PostgreSQL database included
- Easy Node.js deployment
- Automatic SSL certificates
- Good free tier limits

**Quick Deploy:**
```bash
# Run the deployment guide
./scripts/deploy-vercel-render.sh
```

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Option 2: Both on Render

If you prefer to keep everything in one platform:

- **Frontend**: Deploy as Static Site
- **Backend**: Deploy as Web Service
- **Database**: Use Render's PostgreSQL

### Option 3: AWS Deployment

For production environments with AWS:

**ECS with Fargate:**
```bash
# Build and push Docker images
docker build -t insurance-frontend ./frontend
docker build -t insurance-backend ./backend

# Tag for ECR
docker tag insurance-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/insurance-frontend:latest
docker tag insurance-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/insurance-backend:latest

# Push to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/insurance-frontend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/insurance-backend:latest
```

**Elastic Beanstalk:**
```bash
# Create deployment package
zip -r insurance-app.zip . -x "node_modules/*" ".git/*"
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://username:password@host:5432/insurance_db
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Security Considerations

- Input validation on both frontend and backend
- CORS configuration
- Rate limiting (implemented in backend)
- SQL injection prevention with parameterized queries
- Environment variable management

## Project Structure

```
tech_assess/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Next.js pages
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Local development setup
├── docker-compose.prod.yml # Production setup
└── README.md
```

## Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run migrate      # Run database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 