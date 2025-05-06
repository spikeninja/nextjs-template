FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm i -g bun

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* bun.lock* ./

RUN bun install --frozen-lockfile
