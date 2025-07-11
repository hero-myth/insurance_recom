#!/bin/bash

# Life Insurance Recommendation MVP - AWS ECS Deployment Script
# This script deploys the application to AWS ECS with Fargate

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY_PREFIX=${ECR_REPOSITORY_PREFIX:-insurance-mvp}
ECS_CLUSTER_NAME=${ECS_CLUSTER_NAME:-insurance-cluster}
ECS_SERVICE_NAME=${ECS_SERVICE_NAME:-insurance-service}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to AWS ECS...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${YELLOW}📋 AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# Create ECR repositories if they don't exist
echo -e "${YELLOW}📦 Creating ECR repositories...${NC}"

aws ecr create-repository --repository-name ${ECR_REPOSITORY_PREFIX}-frontend --region ${AWS_REGION} 2>/dev/null || true
aws ecr create-repository --repository-name ${ECR_REPOSITORY_PREFIX}-backend --region ${AWS_REGION} 2>/dev/null || true

# Get ECR login token
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build and push Docker images
echo -e "${YELLOW}🏗️  Building and pushing Docker images...${NC}"

# Frontend
echo -e "${YELLOW}📱 Building frontend image...${NC}"
docker build -t ${ECR_REPOSITORY_PREFIX}-frontend ./frontend
docker tag ${ECR_REPOSITORY_PREFIX}-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-frontend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-frontend:latest

# Backend
echo -e "${YELLOW}🔧 Building backend image...${NC}"
docker build -t ${ECR_REPOSITORY_PREFIX}-backend ./backend
docker tag ${ECR_REPOSITORY_PREFIX}-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-backend:latest

echo -e "${GREEN}✅ Docker images pushed successfully!${NC}"

# Create ECS cluster if it doesn't exist
echo -e "${YELLOW}🏗️  Creating ECS cluster...${NC}"
aws ecs create-cluster --cluster-name ${ECS_CLUSTER_NAME} --region ${AWS_REGION} 2>/dev/null || true

# Create task definition
echo -e "${YELLOW}📋 Creating ECS task definition...${NC}"

cat > task-definition.json << EOF
{
  "family": "insurance-mvp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "8000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/insurance-mvp",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "http://localhost:8000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/insurance-mvp",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${AWS_REGION}

echo -e "${GREEN}✅ Task definition registered successfully!${NC}"

# Clean up temporary files
rm -f task-definition.json

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Create an Application Load Balancer"
echo -e "2. Create ECS services for frontend and backend"
echo -e "3. Set up RDS PostgreSQL instance"
echo -e "4. Configure environment variables for database connection"
echo -e "5. Set up CloudWatch logging"
echo -e ""
echo -e "${YELLOW}🔗 ECR Repository URLs:${NC}"
echo -e "Frontend: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-frontend"
echo -e "Backend: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_PREFIX}-backend" 