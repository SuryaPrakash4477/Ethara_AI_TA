# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Declare build args for Vite environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy frontend source files
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
