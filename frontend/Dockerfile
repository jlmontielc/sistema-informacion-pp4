FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY public/ ./public/
COPY src/ ./src/

ARG REACT_APP_API_URL
ARG REACT_APP_IA_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_IA_URL=$REACT_APP_IA_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
