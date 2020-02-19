FROM node:12-alpine

ENV NODE_ENV=production

# https://stackoverflow.com/a/58771365/458610
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-bin-2.30-r0.apk && \
    wget https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz && \
    tar -zxf geckodriver-v0.26.0-linux64.tar.gz -C /usr/bin && \
    apk add --no-cache ttf-freefont firefox-esr glibc-2.30-r0.apk glibc-bin-2.30-r0.apk

RUN mkdir -p /usr/src/app
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app

WORKDIR /usr/src/app

RUN yarn install && \
    yarn cache clean

COPY src/ /usr/src/app/src
COPY tsconfig.json /usr/src/app

RUN adduser -D nonroot
USER nonroot

# Can't use yarn start because https://github.com/yarnpkg/yarn/issues/4667
# ts-node not in PATH
CMD node_modules/ts-node/dist/bin.js --transpile-only src/index.ts
