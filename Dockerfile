<<<<<<< HEAD
# Use official Node.js image as base
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy only backend package files first (for efficient caching)
COPY todo-backend/package*.json ./todo-backend/

# Install backend dependencies
WORKDIR /app/todo-backend
RUN npm install --production

# Copy the rest of the application code, excluding files from .dockerignore
WORKDIR /app
COPY . .

# Set environment variables (you can keep NODE_ENV and PORT, do NOT hardcode MONGODB_URI)
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Command to run the backend
WORKDIR /app/todo-backend
=======
# Use Node 18 Alpine
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# Copy package.json + package-lock.json from todo-backend
COPY todo-backend/package*.json ./
RUN npm ci --production

# Copy backend source code
COPY todo-backend .

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV PORT=4000
EXPOSE 4000

>>>>>>> ca8c717 (Trigger Travis CI build)
CMD ["node", "server.js"]
