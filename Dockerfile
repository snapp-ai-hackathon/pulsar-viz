FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 8080
USER root
RUN chmod +x /docker-entrypoint.sh && \
    rm -f /usr/share/nginx/html/config.js && \
    chown -R 101:101 /usr/share/nginx/html
USER 101

ENTRYPOINT ["/docker-entrypoint.sh"]
