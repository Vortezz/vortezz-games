ARG NODE_VERSION=26-alpine

# Installing
FROM node:${NODE_VERSION} AS installer

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g corepack

WORKDIR /app

COPY . .

RUN corepack enable pnpm
RUN pnpm add -g turbo

RUN turbo prune api --docker

# Building
FROM node:${NODE_VERSION} AS builder

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g corepack

WORKDIR /app

COPY --from=installer /app/out .

RUN corepack enable pnpm
RUN pnpm install --config.confirmModulesPurge=false
RUN pnpm build

# Execution
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
