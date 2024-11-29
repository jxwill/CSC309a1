#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting application..."

# Run the Docker container
echo "Running Docker container..."
docker run -p 3000:3000 nextjs-app

echo "Application is running on http://localhost:3000"