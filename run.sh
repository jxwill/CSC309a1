#!/bin/bash

# Step 1: Start the Docker container in detached mode (background)
echo "Starting Docker container..."
docker-compose up -d

# Step 2: Wait for the server to start
echo "Waiting for the server to start..."
sleep 5  # You can adjust the time if the app takes longer to start

# Step 3: Open the site in the default browser (for Linux)
echo "Opening the site in the browser..."
xdg-open http://localhost:3000  # Linux, replace with `open` on macOS, `start` on Windows

# Optionally, you can check if the server is actually running before opening the browser:
# curl --silent --head --fail http://localhost:3000 || exit 1
