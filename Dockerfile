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

# Build the Next.js app for production
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the app in production mode (you can also use `npm start` if it's set up)
CMD ["npm", "run", "start"]


