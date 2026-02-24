FROM node:24-bookworm-slim AS build-stage

WORKDIR /app

# Copy frontend manifest and lockfile
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM nginx:alpine

# Create the directory nginx includes expect
RUN mkdir -p /etc/nginx/extra-conf.d

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf

EXPOSE 80
