# Generic Node host image for FoodCost (monorepo).
# Build: docker build -t foodcost .
# Run:  docker run -p 3000:3000 --env-file .env.production foodcost
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/costing-engine/package.json packages/costing-engine/
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Public build-time vars must be present for Next.js.
ARG NEXT_PUBLIC_SITE_URL=https://pixplat.com
ARG NEXT_PUBLIC_BASE_PATH=/foodcost
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    FOODCOST_ENV=production
RUN npm run build --workspace apps/web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    FOODCOST_ENV=production
RUN useradd -m nextjs
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages
USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "apps/web"]
