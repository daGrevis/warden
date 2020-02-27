FROM ubuntu:bionic

RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y \
        nodejs \
        yarn \
        # Based on https://hub.docker.com/r/arjun27/playwright-bionic
        libwoff1 \
        libopus0 \
        libwebp6 \
        libwebpdemux2 \
        libenchant1c2a \
        libgudev-1.0-0 \
        libsecret-1-0 \
        libhyphen0 \
        libgdk-pixbuf2.0-0 \
        libegl1 \
        libnotify4 \
        libxslt1.1 \
        libevent-2.1-6 \
        libgles2 \
        libgl1 \
        libegl1 \
        libvpx5 \
        libnss3 \
        libxss1 \
        libasound2 \
        libdbus-glib-1-2 \
        libxt6

ENV NODE_ENV=production

RUN mkdir -p /usr/src/app
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app

WORKDIR /usr/src/app

RUN yarn install && \
    yarn cache clean

COPY src/ /usr/src/app/src
COPY tsconfig.json /usr/src/app

# Can't use yarn start because https://github.com/yarnpkg/yarn/issues/4667
# ts-node not in PATH
CMD node_modules/ts-node/dist/bin.js --transpile-only -r dotenv/config src/index.ts
