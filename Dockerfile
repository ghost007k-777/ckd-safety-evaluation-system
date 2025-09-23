# Lightweight runtime image: we build in GitHub Actions and only serve static files here
FROM nginx:alpine

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Prebuilt app from the CI step (npm run build) – copied directly into the image
COPY dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]