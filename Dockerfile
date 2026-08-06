# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Production ----------
FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/infrastructure/database/prisma/generated ./dist/infrastructure/database/prisma/generated
EXPOSE 3333
CMD ["node", "dist/server.js"]
