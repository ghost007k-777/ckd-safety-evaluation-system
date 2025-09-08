# Use official Node.js runtime as build stage
FROM node:20-bullseye AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (use lockfile if present)
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copy app source
COPY . .

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]