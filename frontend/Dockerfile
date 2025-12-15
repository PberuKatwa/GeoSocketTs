# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

RUN printf "server {\n  listen 8158;\n  server_name _;\n\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files \$uri \$uri/ /index.html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8158

CMD ["nginx", "-g", "daemon off;"]
