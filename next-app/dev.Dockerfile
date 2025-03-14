# FROM node:18-alpine

# Use the official Bun image to leverage Bun as the package manager and runtime
FROM oven/bun:1.1.31

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
COPY bun.lockb* ./
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
#   if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#   elif [ -f package-lock.json ]; then npm ci; \
#   elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
#   # Allow install without lockfile, so example works even without Node.js installed locally
#   else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
#   fi
# Install dependencies using Bun (fallback to npm if needed)
# RUN if [ -f bun.lockb ]; then bun install; \
#     elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
#     elif [ -f package-lock.json ]; then npm ci; \
#     elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install; \
#     else echo "No lockfile found, installing via Bun..." && bun install; fi
RUN bun install

COPY src ./src
COPY public ./public


# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us


# Start Next.js in development mode based on the preferred package manager
# CMD \
#   if [ -f yarn.lock ]; then yarn dev; \
#   elif [ -f package-lock.json ]; then npm run dev; \
#   elif [ -f pnpm-lock.yaml ]; then pnpm dev; \
#   else npm run dev; \
#   fi

# CMD ["npm", "run", "dev"]

CMD ["bun", "run", "dev"]
