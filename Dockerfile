# Use a compatible Node.js version
FROM node:18.18-alpine

# Set the working directory
WORKDIR /app

# Install necessary dependencies (e.g., git)
RUN apk add --no-cache git

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

