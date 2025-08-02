# Multi-stage build for Erlessed Healthcare Platform
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build frontend
COPY . .
RUN npm run build

# Python/FastAPI stage for HMS integration
FROM python:3.11-slim AS python-backend

WORKDIR /app/hms_integration

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY hms_integration/requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt || echo "No requirements.txt found"

# Install Python dependencies manually
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    psycopg2-binary==2.9.9 \
    httpx==0.25.2 \
    python-jose[cryptography]==3.3.0 \
    python-multipart==0.0.6 \
    passlib[bcrypt]==1.7.4 \
    pydantic==2.5.0 \
    sqlalchemy==2.0.23 \
    aiofiles==23.2.1 \
    cryptography==41.0.8 \
    lxml==4.9.3 \
    pandas==2.1.4

# Copy HMS integration source
COPY hms_integration/ ./

# Main application stage
FROM node:20-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    postgresql-client \
    curl \
    tzdata

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built frontend from builder stage
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=frontend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=frontend-builder --chown=nodejs:nodejs /app/package*.json ./

# Copy Python backend
COPY --from=python-backend --chown=nodejs:nodejs /app/hms_integration ./hms_integration

# Copy server code
COPY --chown=nodejs:nodejs server ./server
COPY --chown=nodejs:nodejs shared ./shared
COPY --chown=nodejs:nodejs legal_docs ./legal_docs
COPY --chown=nodejs:nodejs *.ts *.js *.json ./

# Install production dependencies for Node.js
RUN npm ci --only=production && npm cache clean --force

# Create logs directory
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV PYTHONPATH=/app/hms_integration
ENV TZ=Africa/Nairobi

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Start script
COPY --chown=nodejs:nodejs <<EOF /app/start.sh
#!/bin/sh
set -e

# Wait for database
echo "Waiting for database connection..."
until pg_isready -h \${PGHOST:-localhost} -p \${PGPORT:-5432} -U \${PGUSER:-postgres}; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database ready, starting application..."

# Start HMS integration service in background
if [ -f "/app/hms_integration/main.py" ]; then
    echo "Starting HMS integration service..."
    cd /app/hms_integration
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --log-level info &
    cd /app
fi

# Start main application
echo "Starting Erlessed main application..."
exec node server/index.js
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]