FROM node:12-alpine

WORKDIR /bot

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY .env ./
COPY index.js ./

CMD [ "node", "index.js" ]