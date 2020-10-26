FROM node:12-buster AS builder
# Build libvips to fix libheif error
# Remove these steps when no longer required
WORKDIR /tmp/vips/
ADD https://github.com/libvips/libvips/releases/download/v8.10.2/vips-8.10.2.tar.gz .
RUN tar xf vips-8.10.2.tar.gz
WORKDIR /tmp/vips/vips-8.10.2/
RUN ./configure
RUN make && make install && ldconfig

WORKDIR /tmp/build/
COPY package*.json ./
RUN npm install
COPY assets/ assets/
COPY data/ data/
COPY src/ src/
COPY templates/ templates/
COPY *.html ./
COPY webpack.config.js *.ts tsconfig.json ./
RUN NODE_ICU_DATA=node_modules/full-icu node_modules/.bin/webpack --mode=production

FROM nginx:latest
COPY etc/nginx.conf /etc/nginx/conf.d/custom.conf
ENV TZ=Europe/Amsterdam
COPY --from=builder /tmp/build/dist/ /usr/share/nginx/html
