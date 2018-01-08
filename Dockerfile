FROM node:6.11.3

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN cd /usr/src/app && yarn && yarn build
CMD ["sleep","3600"]
