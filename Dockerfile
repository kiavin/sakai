# Stage 1: Build the Vue App
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
# Fix for permission issues during npm install
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine as production-stage
WORKDIR /usr/share/nginx/html

# Copy the built files from Stage 1
COPY --from=build-stage /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
