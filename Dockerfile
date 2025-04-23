# Next.JS run next dev --turbopack

FROM node:22-alpine AS base
WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci

# ---- Build ----
FROM dependencies AS build

# copy rest of source files
COPY .env* .
COPY *config.mjs .
COPY *config.js .
COPY *config.ts .
COPY *config.json .
COPY ./src ./src
COPY ./public ./public

RUN npm run build -- --no-lint

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json .
COPY --from=build /app/*.config.js .
COPY --from=build /app/.env* .


EXPOSE 3000

CMD ["npm", "start", "--", "-H", "0.0.0.0", "-p", "3000"]

