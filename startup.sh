#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting environment setup..."

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Build the Docker image
echo "Building Docker image..."
docker build -t my-app .

# Set up containers (if needed with Docker Compose)
echo "Setting up Docker containers..."
docker-compose up -d

echo "Environment setup complete."

