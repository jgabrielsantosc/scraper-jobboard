FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /usr/src/app

RUN npm install -g npm@8.19.4
RUN npm cache clean --force

COPY package*.json ./

ENV NPM_CONFIG_TIMEOUT=300000
RUN npm ci --verbose

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY src/*.json ./src/

RUN npx playwright install --with-deps chromium

RUN npm run build

RUN ls -R /usr/src/app/dist
RUN cat /usr/src/app/dist/api.js

EXPOSE 3001

CMD ["npm", "run", "serve"]