ARG NODE_VERSION=26-alpine

# Building
FROM node:${NODE_VERSION} AS dependencies

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g corepack

WORKDIR /app

COPY ../../ .

RUN corepack enable pnpm
RUN pnpm install --config.confirmModulesPurge=false
RUN pnpm build

# Execution
CMD ["node", "apps/api/dist/index.js"]
