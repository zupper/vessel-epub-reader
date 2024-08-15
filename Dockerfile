# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY src/ ./src
COPY tsconfig.json ./
COPY webpack.config.js ./

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application files & config from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY runtime-config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

