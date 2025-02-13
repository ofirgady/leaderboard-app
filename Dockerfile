# Base Image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json first for better caching
COPY package*.json ./

# Install Dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code into JavaScript
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]