# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json vite.config.ts server.ts index.html firebase-applet-config.json ./
COPY src ./src
COPY server ./server
RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "dist/server.cjs"]
