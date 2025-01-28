# Base Img
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json for caching
COPY package*.json ./

# Install Dependencies
RUN npm install

# Copy the rest of the application code
COPY src/ ./src
COPY tsconfig.json ./

# Build TypeScript code into JavaScript
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]