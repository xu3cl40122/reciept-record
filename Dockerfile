FROM node:14-alpine

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source
COPY ./ ./
ENV NODE_ENV=development
# 指定執行dev script
CMD ["npm", "run", "start:dev"]

