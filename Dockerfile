# Use the official Playwright image
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your application code
COPY . .

# Build the application
RUN npm run build

# Expose port 3001
EXPOSE 3001

# Add these commands for debugging
RUN playwright --version
RUN which chromium
RUN ls -la /usr/bin/chromium*

# Start the application
CMD ["npm", "run", "serve"]