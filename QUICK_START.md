# Quick Start Guide

## Step 1: Install Docker Desktop
Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/

## Step 2: Open Terminal/Command Prompt
Navigate to the project root directory:
```bash
cd "C:\Users\ankit\OneDrive\Desktop\2-1=2"
```

## Step 3: Start the Project
Run this single command to build and start everything:
```bash
docker compose up -d --build
```

## Step 4: Wait for Services to Start
Check if all services are running:
```bash
docker compose ps
```

You should see 3 services running:
- grocery-mongodb
- grocery-backend  
- grocery-frontend

## Step 5: Sync Products (First Time Only)
Populate the database with products:
```bash
docker compose exec backend npm run sync-products
```

## Step 6: Access the Application
- **Frontend**: Open http://localhost:5173 in your browser
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs

## Step 7: Stop the Project
When done, stop all services:
```bash
docker compose down
```

## Common Commands

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Start services (after stopping)
docker compose up -d
```

That's it! Your application should now be running in Docker containers.




