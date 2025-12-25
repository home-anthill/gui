# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

WORKDIR /ac

ENV PATH=/ac/node_modules/.bin:$PATH

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build:prod

FROM nginx:1.29.4-alpine

RUN apk update \
    && apk upgrade

WORKDIR /ac

COPY --from=builder /ac/dist/ /etc/nginx/html/html

# remove nginx default configuration
RUN rm /etc/nginx/conf.d/default.conf
