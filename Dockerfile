FROM node:10.15.1-slim

EXPOSE 3200

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN cd /usr/src/app && yarn && yarn build

CMD ["npm","run","startup"]
