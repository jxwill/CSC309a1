#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting setup..."

# Install npm dependencies
echo "Installing dependencies..."
# Step 1: Install dependencies using npm
echo "Installing npm dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found, please install Docker."
    exit 1
fi

# Build Docker image
# Step 2: Set up Docker image (build the Docker image)
echo "Building Docker image..."
docker build -t nextjs-app .
docker-compose build

echo "Setup complete."
# Step 3: Run any migrations (if you're using Prisma)
# Example: Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Any other setup steps you might have can go here...

echo "Setup completed!"


