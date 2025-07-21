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

# Only install prod dependencies (Vite preview doesn't need many)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Vite preview requires the full source in some cases (optional, but safe)
COPY --from=builder /app/vite.config.* ./
COPY --from=builder /app/index.html ./

EXPOSE 4173
CMD ["npx", "vite", "preview", "--host"]
