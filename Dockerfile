FROM node:14.18.1 as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY ./ ./
RUN npm run build:server

FROM node:14.18.1
WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./
RUN npm ci
# TODO: use production install after moving migrations to kubernetes job
# https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#helm-chart-hooks
# RUN npm install --production
COPY --from=builder /usr/src/app/dist/server /usr/src/app/dist/server
EXPOSE 3000
ENV NODE_ENV=production
CMD npm run db:migration:up && node ./dist/server/framework/start
