ARG NODE_VERSION=26-alpine

# Building
FROM node:${NODE_VERSION} AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g corepack

WORKDIR /app

COPY . .

RUN corepack enable pnpm
RUN pnpm install --config.confirmModulesPurge=false # TODO : Install and build only useful projects
RUN pnpm build

# Execution
EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
