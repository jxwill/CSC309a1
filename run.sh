#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting the application server..."

# Run the application using Docker
docker run -p 3000:3000 my-app

echo "Application server is running."
