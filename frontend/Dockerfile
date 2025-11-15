# ============================
# Stage 1: Build Angular app
# ============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Build Angular app
RUN npm run build -- --configuration production

# ============================
# Stage 2: Serve with Nginx
# ============================
FROM nginx:alpine

COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
