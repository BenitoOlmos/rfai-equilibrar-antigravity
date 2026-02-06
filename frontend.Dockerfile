# Stage 1: Build
FROM node:20 as builder

WORKDIR /app

# Copiar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Argumentos de construcción para inyectar variables de entorno en frontend estático
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilar proyecto
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copiar build desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración Nginx básica para SPA (redirigir todo a index.html)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
