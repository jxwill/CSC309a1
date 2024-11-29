#!/bin/bash

# Step 1: Install dependencies using npm
echo "Installing npm dependencies..."
npm install

# Step 2: Set up Docker image (build the Docker image)
echo "Building Docker image..."
docker-compose build

# Step 3: Run any migrations (if you're using Prisma)
# Example: Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Any other setup steps you might have can go here...

echo "Setup completed!"


