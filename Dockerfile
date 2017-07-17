FROM node:6.11.1

COPY . /usr/src/app
RUN cd /usr/src/app && yarn && yarn build
CMD ["sleep","3600"]
