# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && npm cache clean --force \
    && apk del .build-deps

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 nodejs \
    && adduser -S nestjs -u 1001 -G nodejs

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
