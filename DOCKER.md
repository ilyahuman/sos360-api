# Docker Setup for SOS360 API

##⚠️ Known Issue: Prisma + pnpm in Docker

Due to pnpm's unique node_modules structure, Prisma client generation in Docker can be problematic. Two approaches are available:

**Approach 1: Build locally, use simple Dockerfile** (Recommended)
**Approach 2: Full multi-stage build in Docker** (May have issues)

## Quick Start

### Approach 1: Build Locally (Recommended)

1. **Build the application locally**:
   ```bash
   pnpm build
   ```

2. **Build Docker image with pre-built app**:
   ```bash
   docker build -f Dockerfile.simple -t sos360-api:latest .
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

### Approach 2: Development with Docker

1. **Start PostgreSQL only** (for local development):
   ```bash
   docker-compose up postgres -d
   ```

2. **Run API locally** with ts-node-dev:
   ```bash
   pnpm dev
   ```

### Production with Docker

1. **Configure environment**:
   ```bash
   cp .env.docker .env.docker.local
   # Edit .env.docker.local with your production values
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up --build -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f api
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## Docker Commands

### Build API image
```bash
docker-compose build api
```

### Start services
```bash
# Start all services
docker-compose up -d

# Start only PostgreSQL
docker-compose up postgres -d

# Start with logs
docker-compose up
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
```

### Execute commands in containers
```bash
# Access API container shell
docker-compose exec api sh

# Run Prisma commands
docker-compose exec api npx prisma studio
docker-compose exec api npx prisma db:push

# Access PostgreSQL
docker-compose exec postgres psql -U user -d sos360
```

## Database Migrations

### Apply migrations in Docker
```bash
docker-compose exec api npx prisma migrate deploy
```

### Create new migration
```bash
# Run locally (not in Docker)
pnpm db:migrate

# Then rebuild Docker image
docker-compose build api
docker-compose up -d
```

### Seed database
```bash
docker-compose exec api pnpm db:seed
```

## Environment Variables

The Docker setup uses `.env.docker` file. Key differences from local `.env`:

- `DATABASE_URL`: Uses `postgres` hostname instead of `localhost`
- `REDIS_URL`: Uses `redis` hostname instead of `localhost`
- `NODE_ENV`: Set to `production`

## Troubleshooting

### API cannot connect to database
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL health
docker-compose exec postgres pg_isready -U user -d sos360

# Check network connectivity
docker-compose exec api ping postgres
```

### Reset database
```bash
# Stop services
docker-compose down -v

# Start fresh
docker-compose up -d
```

### View API container logs
```bash
docker-compose logs -f api
```

### Rebuild from scratch
```bash
# Remove everything
docker-compose down -v
docker rmi sos360-api:latest

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

## Multi-stage Build

The Dockerfile uses multi-stage builds for optimization:

1. **Builder stage**: Compiles TypeScript and generates Prisma client
2. **Runner stage**: Minimal production image with only runtime dependencies

This reduces the final image size significantly.

## Health Checks

Both services have health checks configured:

- **PostgreSQL**: `pg_isready` command every 10s
- **API**: HTTP request to `/health` endpoint every 30s

The API service waits for PostgreSQL to be healthy before starting.

## Network

Services communicate via the `sos360-network` bridge network:

- `postgres`: Database service (accessible via hostname `postgres`)
- `api`: API service (accessible via hostname `api`)

## Volumes

- `postgres_data`: Persists PostgreSQL data
- `./logs`: Mounts local logs directory to container for log persistence

## Port Mapping

- PostgreSQL: `5432:5432` (accessible on localhost:5432)
- API: `3002:3002` (accessible on localhost:3002)
