FROM node

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install --qy

COPY . .
RUN npm run build

CMD ["node", "out/server.js"]