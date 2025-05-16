# frontend/Dockerfile.dev
FROM node:22

# Set working directory
WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start React in development mode with hot reload
CMD ["npm", "start"]
