# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Строим приложение
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Копируем необходимые файлы из build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Меняем владельца
RUN chown -R nextjs:nodejs /app

USER nextjs

# Порт приложения
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запуск приложения
CMD ["node", "server.js"]
