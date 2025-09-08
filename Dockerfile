FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
# Note: Use npm install because package-lock.json may be absent in repo
RUN npm install --no-audit --no-fund

# Build
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Use port 8080 for Cloud Run/preview consistency
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]


