#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting project setup..."

# 1. Install npm dependencies
echo "Installing npm packages..."
npm install

# 2. Check for required environment variables
echo "Checking environment variables..."
REQUIRED_ENV_VARS=("DATABASE_URL" "JWT_SECRET")

for var in "${REQUIRED_ENV_VARS[@]}"
do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var is not set."
    exit 1
  fi
done

# 3. Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 4. Seed the database (create admin user)
echo "Seeding the database with default admin user..."
node prisma/seed.js

echo "Project setup completed successfully."
