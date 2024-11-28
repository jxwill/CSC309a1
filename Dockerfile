# Use the official Node.js image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application into the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port Next.js runs on
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "run", "dev"]
