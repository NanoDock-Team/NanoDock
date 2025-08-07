# Etapa de build con Node 22
FROM node:22 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

COPY --from=build /app/dist/NanoDock-Front /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
