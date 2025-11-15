FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build NestJS app
RUN npm run build

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run compiled NestJS app
CMD ["node", "dist/main.js"]
