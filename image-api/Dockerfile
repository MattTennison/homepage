FROM node:14.16.0-alpine as dependencies

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

FROM node:14.16.0-alpine as development

WORKDIR /app

COPY --from=dependencies ./app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev"]