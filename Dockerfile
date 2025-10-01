FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package.json and prisma schema
COPY package.json ./
COPY prisma ./prisma

# Install all dependencies (including dev deps for build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript (will resolve path aliases with tsc-alias)
RUN npm run build

# Production stage
FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package.json and install production deps only
COPY --from=base /app/package.json ./
COPY --from=base /app/prisma ./prisma

RUN npm install --only=production --legacy-peer-deps --ignore-scripts && \
    npx prisma generate

# Copy built app (paths already resolved)
COPY --from=base /app/dist ./dist

# Expose port
EXPOSE 3002

# Start app (no path resolution needed)
CMD ["node", "dist/app.js"]
