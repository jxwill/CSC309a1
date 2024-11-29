#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting setup..."

# Install npm dependencies
echo "Installing dependencies..."
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
echo "Building Docker image..."
docker build -t nextjs-app .

echo "Setup complete."