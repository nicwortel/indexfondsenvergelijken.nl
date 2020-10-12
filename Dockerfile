FROM nginx:latest

ENV TZ=Europe/Amsterdam

COPY /dist/ /usr/share/nginx/html
