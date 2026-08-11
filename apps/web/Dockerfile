ARG NODE_VERSION=26-alpine

# Building
FROM node:${NODE_VERSION} AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g corepack

WORKDIR /app

COPY ../../ .

RUN corepack enable pnpm
RUN pnpm install --config.confirmModulesPurge=false
RUN pnpm build

# Execution
FROM nginx:1.25.2-alpine-slim

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]