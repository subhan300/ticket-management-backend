# Step 1: Use an official Node.js runtime as the base image
FROM node:16

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Step 4: Install dependencies (this ensures native modules like bcrypt are built in the container)
RUN npm install

# Step 5: Copy the rest of your application code to the container
COPY . .

# Step 6: Expose the port your app runs on (change if your app uses a different port)
EXPOSE 3000

# Step 7: Command to start the application
CMD ["npm", "start"]
