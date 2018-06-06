FROM node:6.14.1

EXPOSE 3200

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN cd /usr/src/app && yarn && yarn build

CMD ["npm","run","startup"]
