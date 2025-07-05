# Use Node.js LTS version as the base image for building the React application
FROM node:lts-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to install dependencies
# Use a wildcard to ensure both lock files are copied
COPY package*.json ./

# Install project dependencies
# The `--force` command might be necessary if there are minor version conflicts
RUN npm install --force

# Copy the entire React application source code into the working directory in the container
COPY . .

# Build the React application for the production environment
# The `npm run build` command will create a `dist` directory containing optimized static files
RUN npm run build

# Use Nginx Alpine image as the base image for the production stage
# Nginx is a lightweight and efficient web server for serving static files
FROM nginx:alpine

# Remove the default Nginx configuration
# This allows us to add our own custom configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration file to the correct location in the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application files from the 'builder' stage to Nginx's serving directory
# The `dist` directory contains the output files from the React build process
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 in the container for Nginx to listen for HTTP connections
EXPOSE 80

# Default command when the container starts: Start Nginx in foreground mode
# This keeps the container running continuously
CMD ["nginx", "-g", "daemon off;"]
