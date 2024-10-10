FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && npm install
RUN npx playwright install chromium --with-deps

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]