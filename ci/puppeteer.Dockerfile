FROM node:10.23.2-alpine3.11@sha256:ab51a7c2f883929f6b82248595693e3954ecdf862a2d1104219fbe19bd78855d

RUN apk update && apk upgrade && \
    apk add --no-cache chromium

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Tell Puppeteer process that we will be running in a container
ENV PUPPETEER_INSIDE_CONTAINER true
