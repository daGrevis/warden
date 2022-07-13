FROM mcr.microsoft.com/playwright:focal

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
