FROM node:14.16.0-alpine as dependencies

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production=true

RUN mkdir ./prod_modules

RUN cp -r ./node_modules/. ./prod_modules

RUN yarn install --frozen-lockfile

FROM node:14.16.0-alpine as development

WORKDIR /app

COPY --from=dependencies ./app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev"]

FROM node:14.16.0-alpine as build

WORKDIR /app

COPY --from=dependencies ./app/package.json ./app/yarn.lock ./
COPY --from=dependencies ./app/node_modules ./node_modules

COPY global.d.ts tsconfig.json  ./
COPY src ./src

RUN yarn build

FROM node:14.16.0-alpine as production

WORKDIR /app

COPY --from=dependencies ./app/prod_modules ./node_modules/
COPY --from=dependencies ./app/package.json ./app/yarn.lock ./
COPY --from=build ./app/dist ./dist

CMD ["yarn", "start:prod"]