FROM node:6.11.0

COPY . /usr/src/app
RUN cd /usr/src/app/passport-verify && yarn && yarn build
RUN cd /usr/src/app && yarn && yarn build
CMD ["sleep","3600"]
