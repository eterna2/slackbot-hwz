FROM node:5
MAINTAINER eterna2 <eterna2@hotmail.com>

WORKDIR /home/slackbot/
EXPOSE 8879

RUN npm install -g pm2
COPY package.json package.json
RUN npm install
COPY index.js index.js
COPY edmw.js edmw.js

CMD pm2 start index.js --no-daemon