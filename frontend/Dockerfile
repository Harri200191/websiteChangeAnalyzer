# === 1. Build stage ===
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# === 2. Serve stage ===
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built app and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/vite.config.* ./   
COPY --from=builder /app/index.html ./      

EXPOSE 4173
CMD ["npx", "vite", "preview", "--host"]
