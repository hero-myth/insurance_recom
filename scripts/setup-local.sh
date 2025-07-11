#!/bin/bash

# Life Insurance Recommendation MVP - Local Setup Script
# This script sets up the local development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up local development environment...${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install it first.${NC}"
    exit 1
fi

# Create environment files if they don't exist
echo -e "${YELLOW}📝 Creating environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/env.example frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local already exists${NC}"
fi

# Build and start the application
echo -e "${YELLOW}🏗️  Building and starting the application...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker-compose exec backend npm run migrate

# Check if services are running
echo -e "${YELLOW}🔍 Checking service status...${NC}"

# Check backend health
if curl -f http://localhost:8000/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
fi

# Check frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✅ Frontend is running at http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
fi

# Check database
if docker-compose exec postgres pg_isready -U postgres &> /dev/null; then
    echo -e "${GREEN}✅ Database is running${NC}"
else
    echo -e "${RED}❌ Database is not responding${NC}"
fi

echo -e "${GREEN}🎉 Local setup completed!${NC}"
echo -e "${YELLOW}📝 Access your application:${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend API: http://localhost:8000"
echo -e "Health Check: http://localhost:8000/health"
echo -e ""
echo -e "${YELLOW}🔧 Useful commands:${NC}"
echo -e "View logs: docker-compose logs -f"
echo -e "Stop services: docker-compose down"
echo -e "Restart services: docker-compose restart"
echo -e "Access database: docker-compose exec postgres psql -U postgres -d insurance_db" 