ARG NODE_VERSION=26-alpine

FROM node:${NODE_VERSION} AS dependencies

RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g corepack

WORKDIR /app

COPY . .

RUN corepack enable pnpm  \
    && pnpm install \
    && pnpm build;