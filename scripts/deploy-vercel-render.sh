#!/bin/bash

# Life Insurance Recommendation MVP - Vercel + Render Deployment Script
# This script helps you deploy frontend to Vercel and backend to Render

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Vercel + Render Deployment Guide${NC}"
echo -e "${BLUE}=====================================${NC}"

echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo -e "1. GitHub repository with your code"
echo -e "2. Vercel account (free)"
echo -e "3. Render account (free)"
echo -e ""

echo -e "${YELLOW}🔧 Step 1: Prepare Your Repository${NC}"
echo -e "Make sure your repository is pushed to GitHub with the following structure:"
echo -e "├── frontend/          # Next.js application"
echo -e "├── backend/           # Node.js API"
echo -e "├── README.md"
echo -e "└── DEPLOYMENT.md"
echo -e ""

echo -e "${YELLOW}🌐 Step 2: Deploy Backend to Render${NC}"
echo -e "1. Go to https://render.com and sign up with GitHub"
echo -e "2. Click 'New' → 'PostgreSQL'"
echo -e "   - Name: insurance-db"
echo -e "   - Plan: Free"
echo -e "3. Note the connection string (you'll need it later)"
echo -e "4. Click 'New' → 'Web Service'"
echo -e "   - Connect your GitHub repository"
echo -e "   - Root Directory: backend"
echo -e "   - Runtime: Node"
echo -e "   - Build Command: npm install && npm run build"
echo -e "   - Start Command: npm start"
echo -e "5. Add Environment Variables:"
echo -e "   - NODE_ENV=production"
echo -e "   - PORT=10000"
echo -e "   - DATABASE_URL=postgresql://username:password@host:5432/database_name"
echo -e "   - CORS_ORIGIN=https://your-frontend-url.vercel.app (update after frontend deploy)"
echo -e "6. Click 'Create Web Service'"
echo -e ""

echo -e "${YELLOW}📱 Step 3: Deploy Frontend to Vercel${NC}"
echo -e "1. Go to https://vercel.com and sign up with GitHub"
echo -e "2. Click 'New Project'"
echo -e "3. Import your GitHub repository"
echo -e "4. Configure project:"
echo -e "   - Root Directory: frontend"
echo -e "   - Framework Preset: Next.js"
echo -e "5. Add Environment Variable:"
echo -e "   - NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com"
echo -e "6. Click 'Deploy'"
echo -e ""

echo -e "${YELLOW}🔗 Step 4: Connect Frontend and Backend${NC}"
echo -e "1. Copy your Vercel frontend URL"
echo -e "2. Go back to Render backend settings"
echo -e "3. Update CORS_ORIGIN with your Vercel URL"
echo -e "4. Redeploy the backend"
echo -e "5. Go back to Vercel and update NEXT_PUBLIC_API_URL with your Render backend URL"
echo -e "6. Redeploy the frontend"
echo -e ""

echo -e "${YELLOW}✅ Step 5: Test Your Deployment${NC}"
echo -e "1. Visit your Vercel frontend URL"
echo -e "2. Test the form submission"
echo -e "3. Check backend health: https://your-backend-url.onrender.com/health"
echo -e ""

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e ""
echo -e "${BLUE}📊 Useful URLs:${NC}"
echo -e "Frontend: https://your-app.vercel.app"
echo -e "Backend: https://your-app.onrender.com"
echo -e "Health Check: https://your-app.onrender.com/health"
echo -e "API Docs: https://your-app.onrender.com/api"
echo -e ""
echo -e "${BLUE}🔧 Management:${NC}"
echo -e "Vercel Dashboard: https://vercel.com/dashboard"
echo -e "Render Dashboard: https://dashboard.render.com"
echo -e ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "1. Set up custom domains (optional)"
echo -e "2. Configure monitoring and logging"
echo -e "3. Set up CI/CD for automatic deployments"
echo -e "4. Add authentication if needed" 