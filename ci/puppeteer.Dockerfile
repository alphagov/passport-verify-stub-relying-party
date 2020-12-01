FROM ghcr.io/alphagov/verify/node:lts-alpine3.12

RUN apk update && apk upgrade && \
    apk add --no-cache chromium

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell Puppeteer process that we will be running in a container
ENV PUPPETEER_INSIDE_CONTAINER true
