# Blockchain API Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy blockchain simulator
COPY standalone-blockchain-simulator.js ./
COPY package*.json ./

# Install dependencies if package.json exists, otherwise create minimal one
RUN if [ -f package.json ]; then npm ci --only=production; else \
    echo '{"name":"blockchain-api","version":"1.0.0","main":"standalone-blockchain-simulator.js","scripts":{"start":"node standalone-blockchain-simulator.js"}}' > package.json; \
    fi

# Create a simple package.json if it doesn't exist
RUN [ ! -f package.json ] && echo '{"name":"blockchain-api","version":"1.0.0","main":"standalone-blockchain-simulator.js","scripts":{"start":"node standalone-blockchain-simulator.js"},"dependencies":{}}' > package.json || true

EXPOSE 7051

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7051/health || exit 1

CMD ["node", "standalone-blockchain-simulator.js"]
