# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/src ./src

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]
