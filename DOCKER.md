# EzTools Docker Deployment Guide

## Prerequisites
- Docker installed (version 24.0+)
- Docker Compose installed (version 2.20+)

## Technology Stack
- **Node.js**: v23.x (latest stable)
- **Next.js**: 16.0.10 (App Router)
- **React**: 19.2.1
- **Base Image**: Alpine Linux (minimal footprint)

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

### 2. Build and Run with Docker Commands

```bash
# Build the image
docker build -t eztools:latest .

# Run the container
docker run -d \
  --name eztools \
  -p 3000:3000 \
  -e NODE_ENV=production \
  eztools:latest

# View logs
docker logs -f eztools

# Stop the container
docker stop eztools
docker rm eztools
```

## Production Deployment

### Using Docker Compose with Custom Port

Edit `docker-compose.yml` and change the port mapping:

```yaml
ports:
  - "8080:3000"  # External:Internal
```

### Environment Variables

Create a `.env.production` file (not included in Docker image for security):

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

Then uncomment the `env_file` section in `docker-compose.yml`

### Health Check

Add to `docker-compose.yml`:

```yaml
services:
  eztools:
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Useful Commands

```bash
# Rebuild image
docker-compose build --no-cache

# View running containers
docker ps

# Execute command in container
docker exec -it eztools sh

# View resource usage
docker stats eztools

# Remove all stopped containers and images
docker system prune -a
```

## CI/CD with GitHub Actions

This project includes automated Docker image builds via GitHub Actions.

### Setup
1. See `.github/workflows/README.md` for complete setup instructions
2. Add Docker Hub credentials to GitHub Secrets:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD` (use access token, not password)
3. Merge a PR or push to `main` to trigger the workflow

### What Happens
- ✅ Automatically builds Docker image on PR merge
- ✅ Pushes to Docker Hub with tags: `latest`, `main`, `main-<sha>`
- ✅ Builds for multiple platforms (amd64, arm64)
- ✅ Uses layer caching for faster builds

### Using the Published Image
```bash
# Pull from Docker Hub
docker pull yourusername/eztools:latest

# Run the container
docker run -d -p 3000:3000 yourusername/eztools:latest
```

## Deployment to Cloud

### Deploy to Railway

```bash
railway login
railway init
railway up
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

### Deploy to DigitalOcean

1. Create a Droplet with Docker
2. Copy files to server
3. Run `docker-compose up -d`

### Deploy Using Docker Hub Image

```bash
# Pull the latest image
docker pull yourusername/eztools:latest

# Run on any server with Docker
docker run -d \
  --name eztools \
  -p 3000:3000 \
  --restart unless-stopped \
  yourusername/eztools:latest
```

## Troubleshooting

### Container won't start
```bash
docker logs eztools
```

### Out of memory
Increase Docker memory limit in Docker Desktop settings or add to `docker-compose.yml`:

```yaml
services:
  eztools:
    deploy:
      resources:
        limits:
          memory: 1G
```

### Port already in use
Change the external port in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

## Performance Optimization

The Dockerfile uses multi-stage builds optimized for Next.js 16:
- ✅ Minimize image size (~200MB vs ~1GB)
- ✅ Improve build caching with separate dependency stage
- ✅ Security: Run as non-root user (nextjs:nodejs)
- ✅ Next.js standalone output for optimal performance
- ✅ Node.js 23.x for latest performance improvements
- ✅ Alpine Linux base for minimal attack surface
- ✅ Production-only dependencies in final image

## Security Best Practices

1. ✅ Non-root user (nextjs:nodejs)
2. ✅ Minimal Alpine Linux base
3. ✅ No development dependencies in production
4. ✅ Environment variables not baked into image
5. ✅ .dockerignore to exclude sensitive files
6. ✅ Latest Node.js 23.x with security patches
7. ✅ Multi-stage build prevents source code in final image

## Node.js Version Information

This project uses **Node.js 23.x** (latest stable release).

### Why Node.js 23?
- Latest performance optimizations
- Native support for React 19 features
- Improved ES modules handling
- Better TypeScript integration

### Alternative: Use Node.js 22 LTS
If you prefer Long-Term Support, edit the Dockerfile:
```dockerfile
FROM node:22-alpine AS deps
FROM node:22-alpine AS builder
FROM node:22-alpine AS runner
```

Node.js 22 is the current LTS version and receives updates until April 2027.
