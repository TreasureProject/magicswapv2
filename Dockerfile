# syntax = docker/dockerfile:1

FROM node:20-slim as base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ARG MAGICSWAPV2_API_URL
ENV MAGICSWAPV2_API_URL=${MAGICSWAPV2_API_URL}
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install -y build-essential pkg-config python-is-python3

# Install pnpm and curl for dependencies in @sushiswap/chains
RUN npm install -g pnpm
RUN apt-get -y update && apt-get -y install curl

# Install node modules
COPY --link package*.json ./
# COPY patches ./patches

RUN npm install --include=dev

# Copy application code
COPY --link . .

# Run code generation
RUN npm run generate

# Build application
RUN --mount=type=secret,id=dotenv,dst=env \
  tr ' ' '\n' < env > .env && \
  npm run build

# Remove development dependencies
RUN npm prune --omit=dev

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
