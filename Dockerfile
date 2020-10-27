FROM node:12-buster AS builder
WORKDIR /tmp/build/
COPY package.json yarn.lock ./
RUN yarn install
COPY assets/ assets/
COPY data/ data/
COPY src/ src/
COPY templates/ templates/
COPY *.html ./
COPY webpack.config.js *.ts tsconfig.json ./
RUN NODE_ICU_DATA=node_modules/full-icu node_modules/.bin/webpack --mode=production

FROM nginx:latest
COPY etc/nginx.conf /etc/nginx/conf.d/default.conf
ENV TZ=Europe/Amsterdam
COPY --from=builder /tmp/build/dist/ /usr/share/nginx/html
