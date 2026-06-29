# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json vite.config.ts server.ts index.html firebase-applet-config.json ./
COPY src ./src
COPY server ./server
RUN npm ci
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "dist/server.cjs"]
