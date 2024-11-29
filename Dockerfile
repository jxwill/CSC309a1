# Use the official Node.js image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Copy the startup script into the container
COPY startup.sh ./startup.sh

# Set the startup.sh script as executable
RUN chmod +x ./startup.sh

# Install dependencies via startup.sh (this will run npm install)
RUN ./startup.sh

# Copy the rest of the application into the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port Next.js runs on
EXPOSE 3000

# Define the command to run the application (start server with run.sh)
CMD ["./run.sh"]

