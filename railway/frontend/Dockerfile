# Railway Frontend Service - Fresh Build v3
FROM node:20-alpine

# Create cache busting
ENV BUILD_CACHE_BUSTER=20250104_092000
RUN echo "Fresh build: $BUILD_CACHE_BUSTER"

# Set working directory
WORKDIR /app

# Create app user first
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy package files with different approach
COPY --chown=nextjs:nodejs frontend/package*.json ./

# Switch to app user for npm operations
USER nextjs

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs frontend/ .

# Build application
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT:-3000}', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Expose port
EXPOSE ${PORT:-3000}

# Start command
CMD ["npm", "start"]
