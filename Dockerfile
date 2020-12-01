FROM ghcr.io/alphagov/verify/node:lts-alpine3.12 

EXPOSE 3200

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN cd /usr/src/app && yarn && yarn build

CMD ["npm","run","startup"]
