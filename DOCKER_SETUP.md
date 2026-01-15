# Docker Setup and Run Commands

## Prerequisites
1. Install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop/
2. Make sure Docker Desktop is running before executing commands

## Commands to Run the Project

### 1. Build and Start All Services
```bash
docker compose up -d --build
```

This command will:
- Build the Docker images for backend and frontend
- Start MongoDB, backend, and frontend services
- Run all services in detached mode (background)

### 2. View Running Containers
```bash
docker compose ps
```

### 3. View Logs
```bash
# View all logs
docker compose logs

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb

# Follow logs in real-time
docker compose logs -f
```

### 4. Stop All Services
```bash
docker compose down
```

### 5. Stop and Remove Volumes (Clean Start)
```bash
docker compose down -v
```

### 6. Restart a Specific Service
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart mongodb
```

### 7. Execute Commands in Containers

#### Run Product Sync Script (in backend container)
```bash
docker compose exec backend npm run sync-products
```

#### Access Backend Container Shell
```bash
docker compose exec backend sh
```

#### Access MongoDB Shell
```bash
docker compose exec mongodb mongosh
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **MongoDB**: localhost:27017

## Initial Setup Steps

1. **Start Docker containers:**
   ```bash
   docker compose up -d --build
   ```

2. **Wait for services to start** (check logs):
   ```bash
   docker compose logs -f
   ```

3. **Sync products from API** (run this once to populate database):
   ```bash
   docker compose exec backend npm run sync-products
   ```

4. **Create admin user** (if needed):
   ```bash
   docker compose exec backend npm run create-admin
   ```

## Troubleshooting

### If containers fail to start:
```bash
# Check logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### If MongoDB connection fails:
- Wait a few seconds for MongoDB to fully start
- Check MongoDB logs: `docker compose logs mongodb`

### If port conflicts occur:
- Stop any services using ports 5000, 5173, or 27017
- Or modify ports in `docker-compose.yml`

### Clean everything and start fresh:
```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

## Environment Variables

Create a `.env` file in the root directory (optional, defaults are set in docker-compose.yml):

```env
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=mongodb://mongodb:27017/grocery
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Useful Docker Commands

```bash
# List all containers
docker ps -a

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# View container resource usage
docker stats

# Stop all containers
docker stop $(docker ps -aq)
```

