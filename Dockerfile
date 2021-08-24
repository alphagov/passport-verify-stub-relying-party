FROM node:10.23.2-alpine3.11

EXPOSE 3200

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN cd /usr/src/app && yarn && yarn build

CMD ["npm","run","startup"]
