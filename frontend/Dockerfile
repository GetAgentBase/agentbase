# Use a specific, recent, stable Node Alpine image (e.g., Node 20 or 22 LTS by Apr 2025)
FROM node:20-alpine

WORKDIR /app

# Copy package manifests first for cache efficiency
COPY package.json ./
COPY package-lock.json ./
# Or: COPY package.json yarn.lock ./ if using Yarn

# Install dependencies cleanly - including devDependencies needed for the build
RUN npm ci
# Removed --only=production to ensure build tools are installed

# Copy the rest of the frontend application code
COPY . .

# Set build-time environment variables if needed by Next.js build
# ARG NEXT_PUBLIC_BACKEND_URL
# ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Build the application for production
RUN npm run build

# Expose the port the app runs on (default for Next.js is 3000)
EXPOSE 3000

# Command to run the production server
CMD ["npm", "start"] 