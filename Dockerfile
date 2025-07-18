# Use official Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first (for efficient caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npm", "start"]
